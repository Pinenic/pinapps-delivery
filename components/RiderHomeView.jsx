'use client'

import Link from 'next/link'
import { useAuthStore } from '@/lib/store/authStore'
import { useApiData, useRealtimeRefetch } from '@/lib/hooks/useApiData'
import { getRiderProfile, listMyOrders } from '@/lib/services/riderService'
import StatusUpdateButton from '@/components/StatusUpdateButton'
import StatusBadge from '@/components/ui/StatusBadge'
import RouteLine from '@/components/ui/RouteLine'
import { formatFee } from '@/lib/formatters'

function KPI({ label, value }) {
  return (
    <div className="glass-card p-3 text-center">
      <p className="font-display text-lg font-semibold">{value}</p>
      <p className="text-[11px] text-[color:var(--color-muted)]">{label}</p>
    </div>
  )
}

export default function RiderHomeView() {
  const user = useAuthStore((s) => s.user)
  const ready = useAuthStore((s) => !!s.session)
  const { data: rider } = useApiData(getRiderProfile, { enabled: ready })
  const { data: myOrders, error, loading, refetch } = useApiData(
    () => listMyOrders('all'),
    { enabled: ready }
  )
  // Also picks up changes StatusUpdateButton makes to the order.
  useRealtimeRefetch(
    'delivery_orders',
    user ? `rider_id=eq.${user.id}` : null,
    refetch,
    ready
  )

  if (loading) {
    return <p className="text-sm text-[color:var(--color-muted)]">Loading…</p>
  }

  const activeOrders =
    myOrders?.filter((o) => !['delivered', 'failed', 'cancelled'].includes(o.status)) || []
  const completedOrders =
    myOrders?.filter((o) => o.status === 'delivered') || []
  const earnings = completedOrders.reduce(
    (sum, o) => sum + (o.delivery_fee || 0),
    0
  )

  return (
    <div className="max-w-md mx-auto">
      <h2 className="font-display text-lg font-semibold mb-3">
        Welcome back
      </h2>

      <div className="grid grid-cols-4 gap-2 mb-6">
        <KPI label="Active" value={activeOrders.length} />
        <KPI label="Completed" value={completedOrders.length} />
        <KPI label="Earned" value={`K${earnings}`} />
        <KPI label="Rating" value={`${rider?.rating ?? '—'}★`} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-base font-semibold">Current jobs</h3>
        <Link
          href="/rider/jobs"
          className="text-xs text-[color:var(--color-primary)] hover:underline"
        >
          Find more
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4">
          Couldn&apos;t load jobs: {error.message}
        </p>
      )}

      {activeOrders.length === 0 && (
        <div className="glass-card-solid p-5 text-center">
          <p className="text-sm text-[color:var(--color-muted)] mb-2">
            No active jobs right now.
          </p>
          <Link
            href="/rider/jobs"
            className="text-sm text-[color:var(--color-primary)] font-medium hover:underline"
          >
            Browse the job market →
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {activeOrders.map((order) => (
          <div key={order.id} className="glass-card-solid p-4">
            <div className="flex items-center justify-between mb-3">
              <StatusBadge status={order.status} />
              <span className="font-mono-tracking text-sm font-medium">
                {formatFee(order.delivery_fee)}
              </span>
            </div>

            <Link href={`/rider/jobs/${order.id}`}>
              <RouteLine
                pickupLabel={order.pickup_name}
                pickupSub={order.pickup_address}
                dropoffLabel={order.dropoff_name}
                dropoffSub={order.dropoff_address}
                compact
              />
            </Link>

            <div className="mt-3">
              <StatusUpdateButton orderId={order.id} currentStatus={order.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
