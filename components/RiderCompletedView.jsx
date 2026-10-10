'use client'

import Link from 'next/link'
import { useAuthStore } from '@/lib/store/authStore'
import { useApiData } from '@/lib/hooks/useApiData'
import { listMyOrders } from '@/lib/services/riderService'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatFee, formatRelativeDate } from '@/lib/formatters'

export default function RiderCompletedView() {
  const ready = useAuthStore((s) => !!s.session)
  const { data: orders, error, loading } = useApiData(
    () => listMyOrders('completed'),
    { enabled: ready }
  )

  if (loading) {
    return <p className="text-sm text-[color:var(--color-muted)]">Loading…</p>
  }

  const totalEarned = (orders || [])
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.delivery_fee || 0), 0)

  return (
    <div className="max-w-md mx-auto">
      <h2 className="font-display text-lg font-semibold mb-1">
        Completed jobs
      </h2>
      <p className="text-sm text-[color:var(--color-muted)] mb-4">
        {orders?.length || 0} jobs · K{totalEarned} earned
      </p>

      {error && (
        <p className="text-sm text-red-600 mb-4">
          Couldn&apos;t load completed jobs: {error.message}
        </p>
      )}

      {(!orders || orders.length === 0) && (
        <p className="text-sm text-[color:var(--color-muted)] text-center py-8">
          Nothing completed yet — jobs you finish will show up here.
        </p>
      )}

      <div className="space-y-2">
        {orders?.map((order) => (
          <Link
            key={order.id}
            href={`/rider/jobs/${order.id}`}
            className="block glass-card-solid p-4"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">{order.dropoff_name}</span>
              <span className="font-mono-tracking text-sm">
                {formatFee(order.delivery_fee)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <StatusBadge status={order.status} />
              <span className="text-[11px] text-[color:var(--color-muted)]">
                {formatRelativeDate(order.created_at)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
