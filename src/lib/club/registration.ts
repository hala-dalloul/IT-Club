import { useQuery, useQueryClient } from "@tanstack/react-query";
import { loadRegistration, type Registration } from "./sheets";

const key = ["club-registration"];

/**
 * Whether the club is taking applications.
 *
 * The answer lives in Google Apps Script, which measures ~3s per call and has a
 * daily quota. The floating button used to ask every 15 seconds, on every
 * focus and on every visibility change, from every page — four calls a minute
 * per visitor for a flag that changes a few times a year.
 *
 * One shared query instead: fetched once per session, reused by every consumer,
 * and never polled. A visitor who leaves the tab open for an hour and comes
 * back gets a stale "open" at worst, and the join form checks again on submit.
 */
export function useRegistration() {
  const client = useQueryClient();

  const query = useQuery<Registration>({
    queryKey: key,
    queryFn: loadRegistration,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const r = query.data;

  return {
    loading: query.isLoading,
    /** Undefined until the answer arrives, so callers can stay quiet meanwhile. */
    open: r ? r.enabled && r.open && r.count < r.limit && r.remaining > 0 : undefined,
    remaining: r?.remaining,
    failed: query.isError,
    /** The submit endpoint just told us the club closed; believe it over the cache. */
    markClosed: () =>
      client.setQueryData<Registration>(key, (prev) => prev && { ...prev, open: false }),
  };
}
