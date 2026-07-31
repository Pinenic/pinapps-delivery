// components/ClaimJobButton.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/authStore'

export default function ClaimJobButton({ orderId }) {
  const router = useRouter()
  const supabase = createClient()
  const currentUser = useAuthStore((s) => s.user)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleClaim() {
    if (!currentUser) {
      setError('Your session could not be verified — try refreshing the page.')
      return
    }

    setSubmitting(true)
    setError('')

    // The race guard: .is('rider_id', null) means this only matches
    // (and only succeeds) if the job is STILL unclaimed at the moment
    // this runs. If another rider claimed it a second ago, this
    // update matches zero rows instead of overwriting their claim —
    // Postgres's row locking is what actually makes this atomic, this
    // filter just expresses the condition.
    const { data, error: updateError } = await supabase
      .from('delivery_orders')
      .update({
        rider_id: currentUser.id,
        status: 'assigned',
        assignment_method: 'self',
      })
      .eq('id', orderId)
      .is('rider_id', null)
      .select('id')

    if (updateError) {
      setError(updateError.message)
      setSubmitting(false)
      return
    }

    if (!data || data.length === 0) {
      setError('Someone else just claimed this job.')
      setSubmitting(false)
      router.refresh() // drop it from this rider's open-pool view
      return
    }

    const { error: logError } = await supabase.from('status_log').insert({
      delivery_order_id: orderId,
      status: 'assigned',
      changed_by: currentUser.id,
      changed_by_role: 'rider',
      notes: 'Self-assigned from open job pool',
    })

    setSubmitting(false)

    if (logError) {
      setError(`Job claimed, but the log entry failed: ${logError.message}`)
      return
    }

    router.refresh()
  }

  return (
    <div>
      <button
        onClick={handleClaim}
        disabled={submitting}
        className="w-full bg-[#1E231C] text-white text-sm px-4 py-2.5 rounded-md hover:bg-[#D4A017] hover:text-[#1E231C] transition-colors disabled:opacity-50"
      >
        {submitting ? 'Claiming...' : 'Claim this job'}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
