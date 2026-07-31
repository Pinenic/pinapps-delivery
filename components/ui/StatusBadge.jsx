// components/ui/StatusBadge.jsx
// One badge component for every status pill in the app. The `stamp`
// look (dashed border, slight rotation) is used for terminal states —
// delivered/failed/cancelled read as "closed," like an ink stamp on a
// waybill, rather than just another color in an otherwise-active pill.
const STATUS_STYLES = {
  pending: { bg: 'bg-black/5', text: 'text-[#5c534e]' },
  assigned: {
    bg: 'bg-[color:var(--color-primary-pale)]',
    text: 'text-[color:var(--color-primary-dark)]',
  },
  picked_up: {
    bg: 'bg-[color:var(--color-warning-pale)]',
    text: 'text-[color:var(--color-warning)]',
  },
  in_transit: {
    bg: 'bg-[color:var(--color-warning-pale)]',
    text: 'text-[color:var(--color-warning)]',
  },
  delivered: {
    bg: 'bg-[color:var(--color-success-pale)]',
    text: 'text-[color:var(--color-success)]',
  },
  failed: {
    bg: 'bg-[color:var(--color-primary-pale)]',
    text: 'text-[color:var(--color-primary-dark)]',
  },
  cancelled: { bg: 'bg-black/5', text: 'text-[#5c534e]' },
}

const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  picked_up: 'Picked up',
  in_transit: 'In transit',
  delivered: 'Delivered',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

const TERMINAL = new Set(['delivered', 'failed', 'cancelled'])

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending
  const label = STATUS_LABELS[status] || status

  if (TERMINAL.has(status)) {
    return (
      <span
        className={`inline-block px-2.5 py-0.5 rounded-md border border-dashed text-xs font-semibold uppercase tracking-wide -rotate-2 ${style.bg} ${style.text}`}
        style={{ borderColor: 'currentColor' }}
      >
        {label}
      </span>
    )
  }

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      {label}
    </span>
  )
}

export { STATUS_LABELS }
