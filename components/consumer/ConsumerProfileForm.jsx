'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { updateProfile } from '@/lib/services/consumerService'
import { normalizeZambianPhone, formatZambianPhone } from '@/lib/phone'

export default function ConsumerProfileForm({ consumer, onSaved }) {

  const [name, setName] = useState(consumer.name ?? '')
  const [phone, setPhone] = useState(
    consumer.phone ? formatZambianPhone(consumer.phone) : ''
  )
  const [status, setStatus] = useState(null)
  const [saving, setSaving] = useState(false)

  const missingPhone = !consumer.phone

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus(null)

    let normalized = null
    if (phone.trim()) {
      normalized = normalizeZambianPhone(phone)
      if (!normalized) {
        setStatus({
          type: 'error',
          message: 'Enter a Zambian mobile number, like 097 123 4567.',
        })
        return
      }
    }

    setSaving(true)
    try {
      // Client-side check above is for instant feedback; the API
      // normalizes and validates again (mobile clients get the same rules).
      await updateProfile({ name: name.trim(), phone: phone.trim() || null })
      setStatus({ type: 'success', message: 'Saved.' })
      onSaved?.()
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Phone isn't required to have an account, but a delivery
          can't happen without one — so nudge here rather than letting
          someone discover it mid-booking. */}
      {missingPhone && (
        <div
          className="flex gap-3 p-4 rounded-xl mb-4"
          style={{ backgroundColor: 'rgba(255,107,0,0.08)' }}
        >
          <AlertCircle
            size={18}
            className="shrink-0 mt-0.5"
            style={{ color: 'var(--consumer-live)' }}
          />
          <p className="text-sm text-[color:var(--consumer-ink)]">
            Add a contact number so riders can reach you about pickups and
            deliveries.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="consumer-card p-5">
        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1.5">Your name</span>
          <input
            required
            className="consumer-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1.5">
            Contact number
          </span>
          <input
            type="tel"
            inputMode="tel"
            placeholder="097 123 4567"
            className="consumer-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <span className="block text-xs text-[color:var(--consumer-muted)] mt-1">
            Used by riders on pickup and drop-off. Not shared publicly.
          </span>
        </label>

        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1.5">Email</span>
          <input
            disabled
            className="consumer-input opacity-60"
            value={consumer.email ?? ''}
          />
          <span className="block text-xs text-[color:var(--consumer-muted)] mt-1">
            This is how you sign in.
          </span>
        </label>

        {status && (
          <p
            className={`text-sm mb-3 ${
              status.type === 'error' ? 'text-red-600' : 'text-green-700'
            }`}
          >
            {status.message}
          </p>
        )}

        <button type="submit" disabled={saving} className="consumer-btn">
          {saving ? 'Saving\u2026' : 'Save changes'}
        </button>
      </form>
    </>
  )
}
