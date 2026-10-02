import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { test } from "node:test";
import assert from "node:assert/strict";

function compile(path, context) {
  const source = readFileSync(path, "utf8").replaceAll("import.meta.env", "({ SSR: true })");
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(js, { exports, URL, URLSearchParams, AbortSignal, Response, ...context });
  return exports;
}

test("public reads use one stable order and propagate cancellation", async () => {
  const controller = new AbortController();
  const calls = [];
  const fetcher = async (url, init) => {
    calls.push({ url: new URL(url), init });
    return Response.json([]);
  };
  const api = compile("src/lib/club/public-api.ts", { fetch: fetcher });
  await api.loadPublic(fetcher, controller.signal);
  const content = calls.find((c) => c.url.pathname.endsWith("club_content"));
  assert.deepEqual(content.url.searchParams.getAll("order"), ["updated_at.desc,id.asc"]);
  assert.notEqual(content.url.searchParams.get("select"), "*");
  controller.abort();
  assert.ok(calls.every((c) => c.init.signal.aborted));
});

function sitemap(fetcher) {
  let handler;
  compile("supabase/functions/sitemap/index.ts", {
    fetch: fetcher,
    Deno: {
      env: {
        get: (name) =>
          name === "SUPABASE_URL" ? "https://example.supabase.co" : '{"default":"test"}',
      },
      serve: (fn) => {
        handler = fn;
      },
    },
  });
  return () => handler(new Request("https://example.test?site=https://club.example"));
}

test("sitemap reads beyond one API page and uses stable ordering", async () => {
  const calls = [];
  const run = sitemap(async (input, init) => {
    const url = new URL(input);
    calls.push(url);
    assert.ok(init.signal);
    assert.equal(url.searchParams.get("order"), "updated_at.desc,id.asc");
    const offset = Number(url.searchParams.get("offset"));
    return Response.json(
      offset === 0
        ? Array.from({ length: 500 }, (_, i) => ({
            id: String(i),
            kind: "news",
            slug: `item-${i}`,
            updated_at: "2026-09-27",
          }))
        : offset === 500
          ? [{ id: "last", kind: "news", slug: "last", updated_at: "2026-09-26" }]
          : [],
    );
  });
  const response = await run();
  assert.equal(response.status, 200);
  assert.match(await response.text(), /news\/last/);
  assert.ok(calls.length >= 2);
});

test("sitemap upstream exceptions return an uncached 502", async () => {
  const response = await sitemap(async () => {
    throw new Error("offline");
  })();
  assert.equal(response.status, 502);
  assert.equal(response.headers.get("Cache-Control"), null);
});

test("SSR coalesces reads, retries failures, and bypasses caches at the origin", async () => {
  let loads = 0;
  let fail = true;
  const fetches = [];
  const api = compile("src/lib/club/ssr-data.ts", {
    require: (name) =>
      name.includes("ClubProvider")
        ? { clubPublicKey: ["club-public"] }
        : {
            configured: true,
            loadPublic: async (fetcher) => {
              loads++;
              if (fail) throw new Error("offline");
              await fetcher("https://example.test");
              return { data: {} };
            },
          },
    fetch: async (_url, init) => {
      fetches.push(init);
      return Response.json([]);
    },
  });
  const client = {
    ensureQueryData: (options) => options.queryFn(),
    fetchQuery: (options) => options.queryFn(),
  };
  await api.loadClubData(client);
  fail = false;
  await Promise.all([api.loadClubData(client), api.loadClubData(client)]);
  assert.equal(loads, 2);
  assert.equal(fetches[0].cache, "no-store");
  await api.refreshClubData(client);
  assert.equal(loads, 3);
  assert.equal(fetches[1].cache, "no-store");
  assert.equal(fetches[1].cf, undefined);
});

test("SSR public data survives worker-isolate restarts in the edge cache", async () => {
  const stored = new Map();
  const cache = {
    async match(request) {
      return stored.get(request.url)?.clone();
    },
    async put(request, response) {
      stored.set(request.url, response.clone());
    },
  };
  let originLoads = 0;
  const context = {
    Request,
    caches: { default: cache },
    fetch: async () => Response.json([]),
    require: (name) =>
      name.includes("ClubProvider")
        ? { clubPublicKey: ["club-public"] }
        : {
            configured: true,
            loadPublic: async () => {
              originLoads++;
              return { data: { members: [] }, settings: { email: "club@example.test" } };
            },
          },
  };
  const client = {
    ensureQueryData: (options) => options.queryFn(),
    fetchQuery: (options) => options.queryFn(),
  };

  await compile("src/lib/club/ssr-data.ts", context).loadClubData(client);
  await compile("src/lib/club/ssr-data.ts", context).loadClubData(client);

  assert.equal(originLoads, 1);
  assert.equal(stored.size, 1);
});

test("floating join waits for the real registration capacity", () => {
  const source = readFileSync("src/components/club/FloatingJoin.tsx", "utf8");

  assert.match(source, /useRegistration\(settings\.registrationOpen === true\)/);
  assert.match(
    source,
    /if \(!settings\.registrationOpen \|\| registration\.open !== true\) return null/,
  );
});
