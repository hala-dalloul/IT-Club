import type { QueryClient } from "@tanstack/react-query";
import { clubPublicKey } from "@/components/club/ClubProvider";
import { configured, loadPublic } from "@/lib/club/public-api";

/** How long the edge may serve a cached copy of the public club data. */
const TTL = 60;

/**
 * A fetch that asks Cloudflare to cache the read.
 *
 * Does nothing on a workers.dev subdomain, where neither the Cache API nor the
 * `cf` options are active — which is why the memory cache below exists. It
 * starts working the day this moves to a custom domain.
 */
const cachingFetch: typeof fetch = (input, init) =>
  // SAFETY: `cf` is a Cloudflare extension to RequestInit that the DOM lib does
  // not declare; every other runtime ignores the unknown property.
  fetch(input, { ...init, cf: { cacheTtl: TTL, cacheEverything: true } } as RequestInit);

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
 * A minute of staleness is invisible: the browser refetches the same query on
 * mount and an admin save invalidates it. A failed fetch is not cached, so the
 * next request retries rather than inheriting the error for a minute.
 */
function publicData(fresh = false) {
  // Route loaders also run in the browser on client-side navigation, where
  // react-query is already the cache and a second Supabase client would only
  // duplicate the auth instance.
  if (!import.meta.env.SSR) return loadPublic();

  const now = Date.now();

  if (!fresh && inflight && now - inflight.at < TTL * 1000) return inflight.value;

  // A fresh read skips the edge cache too, or it would get the same stale copy.
  const value = loadPublic(fresh ? fetch : cachingFetch);
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
 * Refetch past both caches, for a URL the cached copy does not know.
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
