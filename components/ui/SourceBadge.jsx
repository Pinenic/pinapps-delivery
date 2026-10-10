// components/ui/SourceBadge.jsx
// Distinguishes where an order came from at a glance. Business
// orders show the client's actual name (more useful than a generic
// "API" label once there's more than one client); consumer orders
// show a single neutral label since each one is a different person.
export default function SourceBadge({ source, clientName }) {
  const isConsumer = source === 'consumer'

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium ${
        isConsumer
          ? 'bg-[#6366F1]/10 text-[#4F46E5]'
          : 'bg-black/5 text-[color:var(--color-muted)]'
      }`}
    >
      {isConsumer ? 'Consumer' : (clientName ?? 'Business')}
    </span>
  )
}
