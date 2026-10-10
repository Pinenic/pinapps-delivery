'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { advanceStatus } from '@/lib/services/riderService'
import { NEXT_STATUS, NEXT_ACTION_LABEL } from '@/lib/deliveryStatus'

export default function StatusUpdateButton({ orderId, currentStatus }) {
  const router = useRouter()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // delivered / failed / cancelled / pending — nothing for a rider to do here
  if (!NEXT_STATUS[currentStatus]) return null

  async function handleUpdate() {
    setSubmitting(true)
    setError('')

    try {
      // The server works out the next status and writes the order and
      // its log entry together; we only say which status we're looking at.
      const result = await advanceStatus(orderId, currentStatus)
      if (result?.warning) setError(result.warning)
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
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
