"use client";
// Client-side data loading for pages that used to be server components.
//
//   const ready = useConsumerStore((s) => !!s.session)
//   const { data, error, loading, refetch } = useApiData(listDeliveries, { enabled: ready })
//
// `enabled` holds the fetch until the auth store has a session (the
// token isn't available on the very first render). `key` re-runs it
// when an input like a route id changes. refetch() reloads silently
// (no loading flash).
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useApiData(fetcher, { enabled = true, key } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      setData(await fetcherRef.current());
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, key, load]);

  const refetch = useCallback(() => load({ silent: true }), [load]);

  return { data, error, loading, refetch };
}

// Replaces <RealtimeRefresher> on client-fetched pages: router.refresh()
// only re-runs server components, so these pages need to refetch their
// own data when the table changes. `filter` is a Realtime filter string
// like `rider_id=eq.<uuid>`, or null for the whole table.
export function useRealtimeRefetch(table, filter, refetch, enabled = true) {
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useEffect(() => {
    if (!enabled) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`rt:${table}:${filter ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, ...(filter ? { filter } : {}) },
        () => refetchRef.current?.()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, enabled]);
}
