'use client'

import { Phone } from 'lucide-react'

// The obsidian panel the palette was built around. Dark here is
// doing a job, not decoration: it separates "the live thing
// happening right now" from the light, static page around it.
//
// Orange (--consumer-live) appears ONLY while a delivery is in
// motion, so the colour itself carries meaning — if it's orange,
// something is happening right now.
const STAGES = [
  { key: 'pending', label: 'Booked', blurb: 'Looking for a rider' },
  { key: 'assigned', label: 'Rider assigned', blurb: 'On the way to collect' },
  { key: 'picked_up', label: 'Picked up', blurb: 'Your parcel is with the rider' },
  { key: 'in_transit', label: 'In transit', blurb: 'Heading to the drop-off' },
  { key: 'delivered', label: 'Delivered', blurb: 'Handed over' },
]

const LIVE_STATUSES = new Set(['assigned', 'picked_up', 'in_transit'])

export default function TrackingCard({ order, rider }) {
  const currentIndex = STAGES.findIndex((s) => s.key === order.status)
  const isLive = LIVE_STATUSES.has(order.status)
  const isFailed = order.status === 'failed' || order.status === 'cancelled'

  return (
    <div className="consumer-panel-dark p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/50 mb-1">
            Order
          </p>
          <p className="font-mono text-sm text-white/90">
            #{order.id.slice(0, 8)}
          </p>
        </div>

        {isFailed ? (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70 capitalize">
            {order.status}
          </span>
        ) : (
          <span
            className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: isLive
                ? 'rgba(255,107,0,0.15)'
                : 'rgba(255,255,255,0.1)',
              color: isLive ? 'var(--consumer-live)' : 'rgba(255,255,255,0.7)',
            }}
          >
            {isLive && (
              <span
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--consumer-live)' }}
              />
            )}
            {STAGES[currentIndex]?.label ?? order.status}
          </span>
        )}
      </div>

      {isFailed ? (
        <p className="text-sm text-white/60 mb-5">
          This delivery didn&apos;t go through. Get in touch and we&apos;ll
          sort it out.
        </p>
      ) : (
        <ol className="mb-5">
          {STAGES.map((stage, i) => {
            const done = i < currentIndex
            const active = i === currentIndex
            return (
              <li key={stage.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0 mt-1.5"
                    style={{
                      backgroundColor: active
                        ? 'var(--consumer-live)'
                        : done
                          ? 'var(--consumer-accent)'
                          : 'rgba(255,255,255,0.2)',
                    }}
                  />
                  {i < STAGES.length - 1 && (
                    <span
                      className="w-px flex-1 my-1"
                      style={{
                        minHeight: '28px',
                        backgroundColor: done
                          ? 'var(--consumer-accent)'
                          : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  )}
                </div>
                <div className="pb-1">
                  <p
                    className={`text-sm ${
                      active
                        ? 'text-white font-medium'
                        : done
                          ? 'text-white/70'
                          : 'text-white/35'
                    }`}
                  >
                    {stage.label}
                  </p>
                  {active && (
                    <p className="text-xs text-white/50">{stage.blurb}</p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {rider && (
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            <p className="text-xs text-white/50 mb-0.5">Your rider</p>
            <p className="text-sm text-white/90">{rider.name}</p>
          </div>
          <a
            href={`tel:${rider.phone}`}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: 'var(--consumer-accent)',
              color: '#fff',
            }}
          >
            <Phone size={14} /> Call
          </a>
        </div>
      )}
    </div>
  )
}
