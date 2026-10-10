export function formatFee(fee) {
  return fee ? `K${fee}` : '—'
}

export function formatRelativeDate(dateString) {
  const date = new Date(dateString)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.round(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.round(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
