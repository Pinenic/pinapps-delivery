'use client'

// Client view for /orders/[id]. The API returns { order, rider } — the
// rider's name/number comes back from the server, so no service-role
// read happens in the page any more.
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useConsumerStore } from '@/lib/store/consumerStore'
import { getDelivery } from '@/lib/services/bookingService'
import { useApiData, useRealtimeRefetch } from '@/lib/hooks/useApiData'
import TrackingCard from '@/components/consumer/TrackingCard'

export default function OrderDetailView({ id }) {
  const ready = useConsumerStore((s) => !!s.session)
  const { data, loading, refetch } = useApiData(() => getDelivery(id), {
    enabled: ready,
    key: id,
  })
  useRealtimeRefetch('delivery_orders', `id=eq.${id}`, refetch, ready)

  if (loading) {
    return <p className="text-sm text-[color:var(--consumer-muted)]">Loading…</p>
  }

  const order = data?.order ?? null
  const rider = data?.rider ?? null

  if (!order) {
    return (
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-[color:var(--consumer-muted)] mb-4"
        >
          <ArrowLeft size={14} /> Your orders
        </Link>
        <p className="text-sm text-[color:var(--consumer-muted)]">
          We couldn&apos;t find that order.
        </p>
      </div>
    )
  }

  return (
    <div>
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-[color:var(--consumer-muted)] mb-4"
      >
        <ArrowLeft size={14} /> Your orders
      </Link>

      <TrackingCard order={order} rider={rider} />

      <div className="consumer-card p-5 mt-4">
        <h2 className="text-sm font-semibold mb-3">Delivery details</h2>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-[color:var(--consumer-muted)] mb-1">
              Collect from
            </p>
            <p className="font-medium">{order.pickup_name}</p>
            <p className="text-[color:var(--consumer-muted)]">
              {order.pickup_address}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-[color:var(--consumer-muted)] mb-1">
              Deliver to
            </p>
            <p className="font-medium">{order.dropoff_name}</p>
            <p className="text-[color:var(--consumer-muted)]">
              {order.dropoff_address}
            </p>
          </div>

          {order.parcels?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-[color:var(--consumer-muted)] mb-1">
                Parcel
              </p>
              {order.parcels.map((p, i) => (
                <p key={i}>
                  {p.description}
                  {p.weight_kg ? ` · ${p.weight_kg}kg` : ''}
                  {p.fragile ? ' · fragile' : ''}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[color:var(--consumer-line)]">
          <span className="text-sm font-medium">Delivery fee</span>
          <span className="text-sm font-semibold">
            {order.delivery_fee ? `K${order.delivery_fee}` : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
