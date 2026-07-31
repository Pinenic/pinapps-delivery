// components/AssignRiderForm.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/authStore'

export default function AssignRiderForm({ orderId, riders, currentRiderId }) {
  const router = useRouter()
  const supabase = createClient()
  const currentUser = useAuthStore((s) => s.user)

  const [riderId, setRiderId] = useState(currentRiderId || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleAssign(e) {
    e.preventDefault()
    if (!riderId) return

    if (!currentUser) {
      setError('Your session could not be verified — try refreshing the page.')
      return
    }

    setSubmitting(true)
    setError('')

    // Two writes: move the order to `assigned` with `assignment_method: admin`,
    // then log it — mirrors what a rider self-assigning will do later,
    // just with `changed_by_role: 'admin'` instead of 'rider'.
    const { error: updateError } = await supabase
      .from('delivery_orders')
      .update({
        rider_id: riderId,
        status: 'assigned',
        assignment_method: 'admin',
      })
      .eq('id', orderId)

    if (updateError) {
      setError(updateError.message)
      setSubmitting(false)
      return
    }

    const { error: logError } = await supabase.from('status_log').insert({
      delivery_order_id: orderId,
      status: 'assigned',
      changed_by: currentUser.id,
      changed_by_role: 'admin',
      notes: 'Manually assigned by admin',
    })

    setSubmitting(false)

    if (logError) {
      setError(
        `Rider was assigned, but the audit log failed to save: ${logError.message}`
      )
      return
    }

    router.refresh()
  }

  return (
    <form onSubmit={handleAssign} className="flex items-center gap-3">
      <select
        value={riderId}
        onChange={(e) => setRiderId(e.target.value)}
        className="px-3 py-2 border border-[#E5E1D8] rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 focus:border-[#D4A017]"
      >
        <option value="">Select a rider…</option>
        {riders.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name} — {r.status}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={submitting || !riderId}
        className="bg-[#1E231C] text-white text-sm px-4 py-2 rounded-md hover:bg-[#D4A017] hover:text-[#1E231C] transition-colors disabled:opacity-50"
      >
        {submitting
          ? 'Assigning...'
          : currentRiderId
            ? 'Reassign rider'
            : 'Assign rider'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  )
}
