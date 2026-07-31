// app/rider/(protected)/completed/page.jsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatFee, formatRelativeDate } from '@/lib/formatters'

export default async function CompletedJobsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: orders, error } = await supabase
    .from('delivery_orders')
    .select('id, pickup_name, dropoff_name, status, delivery_fee, created_at')
    .eq('rider_id', user.id)
    .in('status', ['delivered', 'failed', 'cancelled'])
    .order('created_at', { ascending: false })

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
