import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { QueryClient } from "@tanstack/react-query";
import { clubPublicKey } from "@/components/club/ClubProvider";
import { configured, loadPublic, url, key } from "@/lib/club/supabase";

/** How long the edge may serve a cached copy of the public club data. */
const TTL = 60;

let cached: SupabaseClient | undefined;

/**
 * A server-only client for the public read.
 *
 * Deliberately separate from the shared one, and it must never carry a
 * signed-in request: everything fetched through here is cached in module scope
 * below and handed to the next visitor.
 *
 * `cf.cacheTtl` is set for the day this moves to a custom domain. It does
 * nothing on a workers.dev subdomain, where neither the Cache API nor the `cf`
 * cache options are active — which is why the memory cache below exists.
 */
function edgeCached() {
  cached ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          // Non-standard, and ignored everywhere except a Cloudflare worker.
          cf: { cacheTtl: TTL, cacheEverything: true },
        } as RequestInit),
    },
  });

  return cached;
}

type Public = Awaited<ReturnType<typeof loadPublic>>;

let inflight: { at: number; value: Promise<Public> } | undefined;

/**
 * The public payload, at most one fetch per isolate per TTL.
 *
 * Measured on the deployed worker, `/` answered between 360ms and 2.9s while
 * `/pathfinder` — the one route with no loader — answered in 80ms. The whole
 * gap was this request, run fresh for every visitor before the first byte of
 * HTML left the worker, and its tail is what made a first open feel slow.
 *
 * A worker isolate survives between requests, so holding the promise here
 * means one visitor per minute per isolate pays for the round trip and the
 * rest are served from memory. Caching the promise rather than the result also
 * collapses a burst of concurrent requests into a single fetch.
 *
 * A minute of staleness is invisible: the browser refetches the same query on
 * mount and an admin save invalidates it. A failed fetch is not cached, so the
 * next request retries rather than inheriting the error for a minute.
 */
function publicData() {
  // Route loaders also run in the browser on client-side navigation, where
  // react-query is already the cache and a second Supabase client would only
  // duplicate the auth instance.
  if (!import.meta.env.SSR) return loadPublic();

  const now = Date.now();

  if (inflight && now - inflight.at < TTL * 1000) return inflight.value;

  const value = loadPublic(edgeCached());
  inflight = { at: now, value };
  value.catch(() => {
    if (inflight?.value === value) inflight = undefined;
  });

  return value;
}

/**
 * Warm the public club data during SSR so the document ships with content.
 *
 * Without this the server rendered only a spinner: the visitor waited for the
 * JS bundle, hydration, and only then a Supabase round trip before anything
 * appeared. The worker is far closer to the database than the visitor is.
 *
 * Failures are swallowed on purpose — the same query runs in ClubProvider on
 * the client, which already renders the error and setup-required states. A
 * database hiccup should degrade to today's client-side fetch, not blank the
 * page behind a router error boundary.
 */
export function loadClubData(queryClient: QueryClient) {
  if (!configured) return;

  return queryClient
    .ensureQueryData({
      queryKey: clubPublicKey,
      queryFn: publicData,
      staleTime: TTL * 1000,
    })
    .catch(() => undefined);
}
