import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { url as supabaseUrl } from "./lib/club/public-api";
import { robotsTxt, siteUrl } from "./lib/club/seo";

type ServerEntry = {
  // oxlint-disable-next-line anti-slop/no-unknown-parameters -- opaque platform env/context, forwarded untouched
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then((m) => {
      // SAFETY: this module's default (or namespace) export is the framework's
      // fetch handler, matching ServerEntry's shape.
      return (m.default ?? m) as ServerEntry;
    });
  }

  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();

  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));

  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    // SAFETY: only the shape of the two fields checked below matters; anything else
    // in the parsed JSON is ignored.
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };

    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

/** The site's first address, kept alive only to forward old links. */
const retiredHost = "ucas.itclub-143.workers.dev";

/**
 * Permanent (301) moves the router can't make itself:
 *
 * - /about/ → /about. The router corrects this too, but always as a temporary
 *   307, which tells search engines to keep the slashed URL around.
 * - The old workers.dev address → the same path on the site's own domain,
 *   once VITE_SITE_URL names one. Until then siteUrl is that address and
 *   nothing moves. Only this exact host: Cloudflare's per-version preview URLs
 *   also end in .workers.dev and must keep working for testing.
 *
 * Both happen in one hop.
 */
function permanentMove(request: Request): Response | undefined {
  if (request.method !== "GET" && request.method !== "HEAD") return undefined;

  const from = new URL(request.url);
  const to = new URL(from);
  const site = new URL(siteUrl);

  if (from.hostname === retiredHost && site.hostname !== retiredHost) {
    to.protocol = site.protocol;
    to.host = site.host;
  }

  to.pathname = to.pathname.replace(/\/+$/, "") || "/";

  return to.href === from.href ? undefined : Response.redirect(to.href, 301);
}

const text = (body: BodyInit | null, type: string) =>
  new Response(body, {
    headers: { "content-type": `${type}; charset=utf-8`, "cache-control": "public, max-age=3600" },
  });

/**
 * The sitemap is built by the `sitemap` Supabase Edge Function from live
 * content; this only forwards it. The site's own address goes along so the
 * domain is set in one place, and the XML type is restored here because
 * Supabase's gateway serves function responses as text/plain.
 */
async function sitemap() {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/sitemap?site=${encodeURIComponent(siteUrl)}`,
  );

  return response.ok
    ? text(response.body, "application/xml")
    : new Response("Sitemap unavailable", { status: 502 });
}

export default {
  // oxlint-disable-next-line anti-slop/no-unknown-parameters -- opaque platform env/context, forwarded untouched
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const moved = permanentMove(request);

    if (moved) return moved;

    const { pathname } = new URL(request.url);

    if (pathname === "/robots.txt") return text(robotsTxt(), "text/plain");
    if (pathname === "/sitemap.xml") return sitemap();

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);

      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);

      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
