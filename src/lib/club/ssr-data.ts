import type { QueryClient } from "@tanstack/react-query";
import { clubPublicKey } from "@/components/club/ClubProvider";
import { configured, loadPublic } from "@/lib/club/public-api";

/** How long the edge may serve a cached copy of the public club data. */
const TTL = 60;

type Public = Awaited<ReturnType<typeof loadPublic>>;

let inflight: { at: number; value: Promise<Public> } | undefined;

/**
 * The public payload, at most one fetch per isolate per TTL.
 *
 * Fetching fresh data for every visitor delays the first byte of HTML.
 *
 * A worker isolate survives between requests, so holding the promise here
 * means one visitor per minute per isolate pays for the round trip and the
 * rest are served from memory. Caching the promise rather than the result also
 * collapses a burst of concurrent requests into a single fetch.
 *
 * The isolate cache lasts 60 seconds. Hydrated clients may retain that snapshot
 * for another 60 seconds; active clients poll every minute. Admin saves only
 * invalidate the current browser. A failed fetch is not cached, so the
 * next request retries rather than inheriting the error for a minute.
 */
function publicData(fresh = false) {
  // Route loaders also run in the browser on client-side navigation, where
  // react-query is already the cache and a second Supabase client would only
  // duplicate the auth instance.
  if (!import.meta.env.SSR) return loadPublic();

  const now = Date.now();

  if (!fresh && inflight && now - inflight.at < TTL * 1000) return inflight.value;

  // One server cache layer avoids stacking isolate and upstream HTTP TTLs.
  const value = loadPublic((input, init) => fetch(input, { ...init, cache: "no-store" }));
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
      queryFn: () => publicData(),
      staleTime: TTL * 1000,
    })
    .catch(() => undefined);
}

/**
 * Refetch past the query and isolate caches, for a URL the cached copy does not know.
 *
 * The cached payload can be up to a minute old, so an item published in that
 * minute would otherwise answer 404 to whoever opens its link first.
 */
export function refreshClubData(queryClient: QueryClient) {
  if (!configured) return;

  return queryClient
    .fetchQuery({ queryKey: clubPublicKey, queryFn: () => publicData(true), staleTime: 0 })
    .catch(() => undefined);
}
