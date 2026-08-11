// app/rider/(protected)/jobs/[id]/page.jsx
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ClaimJobButton from '@/components/ClaimJobButton'
import StatusUpdateButton from '@/components/StatusUpdateButton'
import RealtimeRefresher from '@/components/RealtimeRefresher'
import StatusBadge, { STATUS_LABELS } from '@/components/ui/StatusBadge'
import RouteLine from '@/components/ui/RouteLine'
import { formatFee } from '@/lib/formatters'

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('delivery_orders')
    .select('pickup_name, dropoff_name')
    .eq('id', id)
    .maybeSingle()

  if (!order) return { title: 'Job not found' }

  return {
    title: `${order.pickup_name} → ${order.dropoff_name}`,
  }
}

export default async function RiderJobDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: order } = await supabase
    .from('delivery_orders')
    .select('*, parcels(*)')
    .eq('id', id)
    .maybeSingle()

  if (!order) {
    return (
      <div className="max-w-md mx-auto">
        <BackLink />
        <p className="text-sm text-[color:var(--color-muted)] mt-4">
          This job isn&apos;t available — it may have been claimed by someone
          else or no longer exists.
        </p>
      </div>
    )
  }

  const isMine = order.rider_id === user.id
  const isOpen = order.status === 'pending' && !order.rider_id

  const { data: statusLog } = isMine
    ? await supabase
        .from('status_log')
        .select('*')
        .eq('delivery_order_id', id)
        .order('changed_at', { ascending: true })
    : { data: null }

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(order.dropoff_address)}`

  return (
    <div className="max-w-md mx-auto">
      <RealtimeRefresher table="delivery_orders" filter={`id=eq.${order.id}`} />

      <BackLink />

      <div className="flex items-center justify-between mt-3 mb-4">
        <h2 className="font-display text-lg font-semibold">Job details</h2>
        <StatusBadge status={order.status} />
      </div>

      <div className="glass-card-solid p-5 mb-4">
        <RouteLine
          pickupLabel={order.pickup_name}
          pickupSub={`${order.pickup_phone} · ${order.pickup_address}`}
          dropoffLabel={order.dropoff_name}
          dropoffSub={`${order.dropoff_phone} · ${order.dropoff_address}`}
        />

        {order.parcels?.length > 0 && (
          <>
            <hr className="my-4 border-[color:var(--color-border)]" />
            <h3 className="text-sm font-semibold mb-1">Parcel</h3>
            {order.parcels.map((p) => (
              <p key={p.id} className="text-sm text-[color:var(--color-muted)]">
                {p.description}
                {p.weight_kg ? ` — ${p.weight_kg}kg` : ''}
                {p.fragile ? ' (fragile)' : ''}
              </p>
            ))}
          </>
        )}

        <hr className="my-4 border-[color:var(--color-border)]" />
        <p className="text-sm">
          Delivery fee:{' '}
          <span className="font-mono-tracking font-medium">
            {formatFee(order.delivery_fee)}
          </span>
        </p>
      </div>

      {isOpen && (
        <div className="glass-card-solid p-5 mb-4">
          <ClaimJobButton orderId={order.id} />
        </div>
      )}

      {isMine && (
        <>
          <div className="glass-card-solid p-5 mb-4 space-y-3">
            <StatusUpdateButton orderId={order.id} currentStatus={order.status} />
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full text-sm text-[color:var(--color-primary-dark)] border border-[color:var(--color-primary)] rounded-full py-2"
            >
              <ExternalLink size={14} /> Open dropoff in Maps
            </a>
          </div>

          <div className="glass-card-solid p-5">
            <h3 className="font-semibold text-sm mb-3">Status history</h3>
            <ul className="space-y-2">
              {statusLog?.map((log) => (
                <li key={log.id} className="text-sm flex items-center justify-between">
                  <span>{STATUS_LABELS[log.status] || log.status}</span>
                  <span className="text-xs text-[color:var(--color-muted)]">
                    {new Date(log.changed_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {!isMine && !isOpen && (
        <p className="text-sm text-[color:var(--color-muted)] text-center py-4">
          This job has already been claimed.
        </p>
      )}
    </div>
  )
}

function BackLink() {
  return (
    <Link
      href="/rider/jobs"
      className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
    >
      <ArrowLeft size={14} /> Back
    </Link>
  )
}
