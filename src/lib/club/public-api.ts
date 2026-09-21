import type { Content, ContentCollection, Settings } from "./model";

/**
 * The public read path, without the Supabase SDK.
 *
 * Everything a visitor sees is two PostgREST GETs and one RPC, all anonymous,
 * all guarded by RLS. Reaching them through `createClient` pulled the whole SDK
 * — auth, realtime, storage, functions — into the entry bundle: 58 KB gzipped,
 * measured against this exact version, on every page load, for features only
 * `/admin` uses. `fetch` covers it.
 *
 * The SDK is still the right tool behind the admin console, where sessions,
 * uploads and row-level writes actually need it, and it is code-split there.
 */

// Public browser configuration; RLS still controls all data access.
export const url = import.meta.env.VITE_SUPABASE_URL || "https://jxweaxenswbjpxxjmihb.supabase.co";

export const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_kHJik-SCyMiMQ7nn2SRHbQ_0FR6CpOZ";

export const configured = Boolean(url && key);

export class SetupRequiredError extends Error {
  constructor() {
    super("Supabase database setup is required. Run the supplied migration.");
  }
}

/** The migration has not been run yet; the admin screen explains what to do. */
const setupCodes = ["PGRST205", "42P01", "PGRST202"];

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type Row = Record<string, JsonValue>;

/** The server hands in a fetch that caches; the browser uses its own. */
export type Fetcher = typeof fetch;

/**
 * One PostgREST call.
 *
 * SAFETY: the caller names the row shape it selected. Every call site below
 * passes a `select` that matches the type it asks for, and the rows themselves
 * are only ever written through the validated admin path.
 */
async function request<T>(path: string, init: RequestInit, f: Fetcher): Promise<T> {
  const response = await f(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, ...init.headers },
  });

  if (response.ok) {
    // SAFETY: T names the shape this path's `select` returns; see above.
    return (await response.json()) as T;
  }

  // PostgREST reports failures as JSON; a proxy or outage may not.
  let code = "";
  let message = `Request failed (${response.status})`;

  try {
    // SAFETY: PostgREST's error envelope; any other body falls to the catch.
    const body = (await response.json()) as { code?: string; message?: string };
    code = body.code || "";
    message = body.message || message;
  } catch {
    /* Keep the status-derived message. */
  }

  if (setupCodes.includes(code)) throw new SetupRequiredError();
  throw new Error(message);
}

async function rows(table: string, order: string, f: Fetcher) {
  const result: Row[] = [];

  for (let offset = 0; ; offset += 500) {
    const page = await request<Row[]>(
      `${table}?select=*&order=${order}.desc&order=id.asc&offset=${offset}&limit=500`,
      { method: "GET" },
      f,
    );

    result.push(...page);

    if (page.length < 500) break;
  }

  return result;
}

/** Every public row the site renders, in one shape the provider can hold. */
export async function loadPublic(f: Fetcher = fetch) {
  const [content, settings] = await Promise.all([
    rows("club_content", "updated_at", f),
    request<{ data?: Settings }[]>(
      "club_settings?select=data&id=eq.public&limit=1",
      { method: "GET" },
      f,
    ),
  ]);

  const data: Record<ContentCollection, Content[]> = {
    members: [],
    events: [],
    news: [],
    partners: [],
  };

  for (const row of content) {
    // SAFETY: kind is unverified until the hasOwn check below drops rows that
    // aren't one of the supported ContentCollection keys.
    const kind = row["kind"] as ContentCollection;

    if (!Object.hasOwn(data, kind)) continue;
    data[kind].push({
      // SAFETY: club_content.data is only ever written by saveContent, which
      // validates the value against contentSchema before insert.
      ...(row["data"] as Omit<Content, "id">),
      id: String(row["id"]),
      createdAt: String(row["created_at"] ?? ""),
      updatedAt: row["updated_at"],
      updatedBy: String(row["updated_by"] || ""),
    });
  }

  return { data, settings: settings[0]?.data };
}

/** Records this session's visit and returns the running total. */
export async function recordClubVisit(visitId: string) {
  const value = await request<number>(
    "rpc/record_club_visit",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visit_id: visitId }),
    },
    fetch,
  );

  const count = Number(value);

  if (!Number.isSafeInteger(count) || count < 0) throw new Error("Invalid visit count");

  return count;
}
