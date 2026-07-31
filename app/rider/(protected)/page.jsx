// app/rider/(protected)/page.jsx — Home: KPIs + current active jobs
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatusUpdateButton from '@/components/StatusUpdateButton'
import RealtimeRefresher from '@/components/RealtimeRefresher'
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

export default async function RiderHomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: rider } = await supabase
    .from('riders')
    .select('rating')
    .eq('id', user.id)
    .single()

  const { data: myOrders, error } = await supabase
    .from('delivery_orders')
    .select(
      'id, pickup_name, pickup_address, dropoff_name, dropoff_address, status, delivery_fee, parcels(description, weight_kg, fragile)'
    )
    .eq('rider_id', user.id)
    .order('created_at', { ascending: false })

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
      <RealtimeRefresher table="delivery_orders" filter={`rider_id=eq.${user.id}`} />

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
