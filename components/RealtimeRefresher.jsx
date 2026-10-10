'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Renders nothing — just subscribes to Postgres changes on `table`
// (optionally scoped with a Supabase realtime `filter`, e.g.
// "delivery_order_id=eq.<id>") and calls router.refresh() when
// something changes, so server-fetched data stays live without polling.
//
// Requires the table to be added to the supabase_realtime publication —
// see 002_enable_realtime.sql.
export default function RealtimeRefresher({ table, filter }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`realtime-${table}-${filter || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        () => {
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter])

  return null
}
