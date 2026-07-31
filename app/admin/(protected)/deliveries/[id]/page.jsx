// app/admin/(protected)/deliveries/[id]/page.jsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import AssignRiderForm from '@/components/AssignRiderForm'
import RealtimeRefresher from '@/components/RealtimeRefresher'
import StatusBadge from '@/components/ui/StatusBadge'
import RouteLine from '@/components/ui/RouteLine'
import { STATUS_LABELS } from '@/components/ui/StatusBadge'

export default async function DeliveryDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('delivery_orders')
    .select('*, parcels(*)')
    .eq('id', id)
    .single()

  const { data: riders } = await supabase
    .from('riders')
    .select('id, name, status')
    .order('name')

  const { data: statusLog } = await supabase
    .from('status_log')
    .select('*')
    .eq('delivery_order_id', id)
    .order('changed_at', { ascending: true })

  if (!order) {
    return (
      <div>
        <Link
          href="/admin"
          className="text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
        >
          ← Back to deliveries
        </Link>
        <p className="text-sm text-[color:var(--color-muted)] mt-4">
          Delivery not found.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <RealtimeRefresher
        table="status_log"
        filter={`delivery_order_id=eq.${order.id}`}
      />

      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
      >
        <ArrowLeft size={14} /> Back to deliveries
      </Link>

      <div className="flex items-center justify-between mt-3 mb-5">
        <div>
          <h2 className="font-display text-xl font-semibold">
            Delivery detail
          </h2>
          <p className="font-mono-tracking text-xs text-[color:var(--color-muted)]">
            #{order.id.slice(0, 8)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="glass-card-solid p-6 mb-4">
        <RouteLine
          pickupLabel={order.pickup_name}
          pickupSub={`${order.pickup_phone} · ${order.pickup_address}`}
          dropoffLabel={order.dropoff_name}
          dropoffSub={`${order.dropoff_phone} · ${order.dropoff_address}`}
        />

        {order.parcels?.length > 0 && (
          <>
            <hr className="my-4 border-[color:var(--color-border)]" />
            <h3 className="font-semibold text-sm mb-1">Parcel</h3>
            {order.parcels.map((p) => (
              <p key={p.id} className="text-sm text-[color:var(--color-muted)]">
                {p.description}
                {p.weight_kg ? ` — ${p.weight_kg}kg` : ''}
                {p.fragile ? ' (fragile)' : ''}
              </p>
            ))}
          </>
        )}

        {order.delivery_fee && (
          <>
            <hr className="my-4 border-[color:var(--color-border)]" />
            <p className="text-sm">
              Delivery fee:{' '}
              <span className="font-mono-tracking font-medium">
                K{order.delivery_fee}
              </span>
            </p>
          </>
        )}
      </div>

      <div className="glass-card-solid p-6 mb-4">
        <h3 className="font-semibold text-sm mb-3">Rider assignment</h3>
        <AssignRiderForm
          orderId={order.id}
          riders={riders || []}
          currentRiderId={order.rider_id}
        />
      </div>

      <div className="glass-card-solid p-6">
        <h3 className="font-semibold text-sm mb-3">Status history</h3>
        <ul className="space-y-2">
          {statusLog?.map((log) => (
            <li key={log.id} className="text-sm flex items-center justify-between">
              <span>{STATUS_LABELS[log.status] || log.status}</span>
              <span className="text-xs text-[color:var(--color-muted)]">
                {log.changed_by_role} ·{' '}
                {new Date(log.changed_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
