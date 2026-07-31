// components/ui/RouteLine.jsx
// The one motif repeated across the dashboard table, delivery detail,
// and rider job cards: a solid dot at pickup, a dashed line, a pin at
// dropoff. This is the signature element — it's what a waybill is
// actually communicating (a journey between two points), not a
// decorative flourish.
export default function RouteLine({
  pickupLabel,
  pickupSub,
  dropoffLabel,
  dropoffSub,
  compact = false,
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-1">
        <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-primary)] shrink-0" />
        <span
          className="w-px flex-1 my-1"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, var(--color-primary) 50%, transparent 50%)',
            backgroundSize: '1px 6px',
            minHeight: compact ? '20px' : '32px',
          }}
        />
        <svg width="10" height="12" viewBox="0 0 10 12" className="shrink-0" fill="none">
          <path
            d="M5 12C5 12 10 7.36 10 4.5C10 2.01 7.76 0 5 0C2.24 0 0 2.01 0 4.5C0 7.36 5 12 5 12Z"
            fill="var(--color-primary)"
          />
          <circle cx="5" cy="4.5" r="1.8" fill="white" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className={compact ? 'mb-2' : 'mb-4'}>
          <p className="text-sm text-[color:var(--color-ink)] truncate">
            {pickupLabel}
          </p>
          {pickupSub && (
            <p className="text-xs text-[color:var(--color-muted)] truncate">
              {pickupSub}
            </p>
          )}
        </div>
        <div>
          <p className="text-sm text-[color:var(--color-ink)] truncate">
            {dropoffLabel}
          </p>
          {dropoffSub && (
            <p className="text-xs text-[color:var(--color-muted)] truncate">
              {dropoffSub}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
