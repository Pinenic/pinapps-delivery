'use client'

import { useAuthStore } from '@/lib/store/authStore'
import { useApiData, useRealtimeRefetch } from '@/lib/hooks/useApiData'
import { listOpenJobs } from '@/lib/services/riderService'
import JobMarketList from '@/components/JobMarketList'

export default function RiderJobMarketView() {
  const ready = useAuthStore((s) => !!s.session)
  const { data: openJobs, error, loading, refetch } = useApiData(listOpenJobs, {
    enabled: ready,
  })
  // Whole table (no filter): any new/claimed job changes the pool.
  useRealtimeRefetch('delivery_orders', null, refetch, ready)

  if (loading) {
    return <p className="text-sm text-[color:var(--color-muted)]">Loading…</p>
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="font-display text-lg font-semibold mb-3">Job market</h2>

      {error && (
        <p className="text-sm text-red-600 mb-4">
          Couldn&apos;t load open jobs: {error.message}
        </p>
      )}

      <JobMarketList jobs={openJobs || []} />
    </div>
  )
}
