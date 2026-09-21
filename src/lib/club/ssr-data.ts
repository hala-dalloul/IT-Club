import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { QueryClient } from "@tanstack/react-query";
import { clubPublicKey } from "@/components/club/ClubProvider";
import { configured, loadPublic, url, key } from "@/lib/club/supabase";

/** How long the edge may serve a cached copy of the public club data. */
const TTL = 60;

let cached: SupabaseClient | undefined;

/**
 * A server-only client whose reads are cached at the Cloudflare edge.
 *
 * Measured on the deployed worker, `/` answered in 360ms at best and 2.9s at
 * worst, while `/pathfinder` — the one route with no loader — answered in 80ms.
 * The whole difference was this request: every single visitor was paying for a
 * fresh round trip to Supabase before the first byte of HTML left the worker.
 *
 * `cacheTtl` puts the PostgREST GET in Cloudflare's cache for a minute, so one
 * visitor per minute per edge pays that cost and everybody else is served from
 * memory. A minute of staleness is invisible here: the browser refetches the
 * same query on mount, and the admin panel's saves invalidate it immediately.
 *
 * This client is deliberately separate from the shared one. It must never be
 * used for a signed-in request: caching a response carrying a user's JWT would
 * hand one visitor's data to the next. Only the public, anonymous read below
 * ever goes through it.
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
      queryFn: () => loadPublic(edgeCached()),
      staleTime: TTL * 1000,
    })
    .catch(() => undefined);
}
