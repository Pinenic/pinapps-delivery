// components/StatusUpdateButton.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/authStore'
import { NEXT_STATUS, NEXT_ACTION_LABEL } from '@/lib/deliveryStatus'

export default function StatusUpdateButton({ orderId, currentStatus }) {
  const router = useRouter()
  const supabase = createClient()
  const currentUser = useAuthStore((s) => s.user)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const nextStatus = NEXT_STATUS[currentStatus]

  // delivered / failed / cancelled / pending — nothing for a rider to do here
  if (!nextStatus) return null

  async function handleUpdate() {
    if (!currentUser) {
      setError('Your session could not be verified — try refreshing the page.')
      return
    }

    setSubmitting(true)
    setError('')

    // RLS only allows this when delivery_orders.rider_id = auth.uid(),
    // so a rider can't update a job that isn't theirs.
    const { error: updateError } = await supabase
      .from('delivery_orders')
      .update({ status: nextStatus })
      .eq('id', orderId)

    if (updateError) {
      setError(updateError.message)
      setSubmitting(false)
      return
    }

    const { error: logError } = await supabase.from('status_log').insert({
      delivery_order_id: orderId,
      status: nextStatus,
      changed_by: currentUser.id,
      changed_by_role: 'rider',
    })

    setSubmitting(false)

    if (logError) {
      setError(`Status updated, but the log entry failed: ${logError.message}`)
      return
    }

    router.refresh()
  }

  return (
    <div>
      <button
        onClick={handleUpdate}
        disabled={submitting}
        className="w-full bg-[#1E231C] text-white text-sm px-4 py-2.5 rounded-md hover:bg-[#D4A017] hover:text-[#1E231C] transition-colors disabled:opacity-50"
      >
        {submitting ? 'Updating...' : NEXT_ACTION_LABEL[currentStatus]}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
