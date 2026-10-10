'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import { normalizeZambianPhone } from '@/lib/phone'
import { createDelivery } from '@/lib/services/bookingService'

const STEPS = ['Pickup', 'Dropoff', 'Parcel', 'Review']

function StepDots({ current }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-1.5 flex-1">
          <div
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= current
                ? 'bg-[color:var(--consumer-accent)]'
                : 'bg-[color:var(--consumer-line)]'
            }`}
          />
        </div>
      ))}
    </div>
  )
}

function Field({ label, children, hint }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      {children}
      {hint && (
        <span className="block text-xs text-[color:var(--consumer-muted)] mt-1">
          {hint}
        </span>
      )}
    </label>
  )
}

export default function BookingFlow({ tiers, feeRuleType, flatAmount, consumer }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    // Defaults to the consumer's own details — "I'm sending this
    // myself" is the common case, but both stay editable so
    // "collect it from someone else" works without a separate flow.
    pickup_name: consumer?.name ?? '',
    pickup_phone: consumer?.phone ?? '',
    pickup_address: '',
    dropoff_name: '',
    dropoff_phone: '',
    dropoff_address: '',
    parcel_description: '',
    parcel_weight_kg: '',
    parcel_fragile: false,
    parcel_size: '',
  })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const isTiered = feeRuleType === 'tiered'
  const selectedTier = tiers.find((t) => t.key === form.parcel_size)
  const fee = isTiered ? selectedTier?.price : flatAmount

  function validateStep() {
    if (step === 0) {
      if (!form.pickup_name.trim() || !form.pickup_address.trim()) {
        return 'Add a pickup name and address.'
      }
      if (!normalizeZambianPhone(form.pickup_phone)) {
        return 'Enter a valid Zambian pickup number.'
      }
    }
    if (step === 1) {
      if (!form.dropoff_name.trim() || !form.dropoff_address.trim()) {
        return 'Add a recipient name and address.'
      }
      if (!normalizeZambianPhone(form.dropoff_phone)) {
        return "Enter a valid Zambian number for the recipient."
      }
    }
    if (step === 2) {
      if (!form.parcel_description.trim()) {
        return 'Describe what you&apos;re sending.'
      }
      if (isTiered && !form.parcel_size) {
        return 'Pick a parcel size.'
      }
    }
    return null
  }

  function next() {
    const problem = validateStep()
    if (problem) {
      setError(problem)
      return
    }
    setError('')
    setStep((s) => s + 1)
  }

  function back() {
    setError('')
    setStep((s) => s - 1)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')

    try {
      const data = await createDelivery({
        ...form,
        // Normalize at the boundary so what's stored is always E.164,
        // whatever format the person typed.
        pickup_phone: normalizeZambianPhone(form.pickup_phone),
        dropoff_phone: normalizeZambianPhone(form.dropoff_phone),
        parcel_weight_kg: form.parcel_weight_kg
          ? Number(form.parcel_weight_kg)
          : null,
      })

      router.push(`/orders/${data.id}`)
      router.refresh()
    } catch (err) {
      setError(err.message ?? 'Could not create your order.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <StepDots current={step} />

      {step > 0 && (
        <button
          onClick={back}
          className="flex items-center gap-1.5 text-sm text-[color:var(--consumer-muted)] mb-4"
        >
          <ArrowLeft size={14} /> Back
        </button>
      )}

      <div className="consumer-card p-5">
        {step === 0 && (
          <>
            <h2 className="text-lg font-semibold mb-4">Where do we collect?</h2>
            <Field label="Contact name">
              <input
                className="consumer-input"
                value={form.pickup_name}
                onChange={(e) => update('pickup_name', e.target.value)}
              />
            </Field>
            <Field label="Contact number">
              <input
                type="tel"
                inputMode="tel"
                className="consumer-input"
                value={form.pickup_phone}
                onChange={(e) => update('pickup_phone', e.target.value)}
              />
            </Field>
            <Field
              label="Pickup address"
              hint="Include a landmark if it helps the rider find you."
            >
              <textarea
                rows={2}
                className="consumer-input"
                value={form.pickup_address}
                onChange={(e) => update('pickup_address', e.target.value)}
              />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold mb-4">Where is it going?</h2>
            <Field label="Recipient name">
              <input
                className="consumer-input"
                value={form.dropoff_name}
                onChange={(e) => update('dropoff_name', e.target.value)}
              />
            </Field>
            <Field label="Recipient number">
              <input
                type="tel"
                inputMode="tel"
                className="consumer-input"
                value={form.dropoff_phone}
                onChange={(e) => update('dropoff_phone', e.target.value)}
              />
            </Field>
            <Field
              label="Delivery address"
              hint="Include a landmark if it helps the rider find them."
            >
              <textarea
                rows={2}
                className="consumer-input"
                value={form.dropoff_address}
                onChange={(e) => update('dropoff_address', e.target.value)}
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold mb-4">
              What are you sending?
            </h2>
            <Field label="Description">
              <input
                placeholder="e.g. documents, a phone, a small box"
                className="consumer-input"
                value={form.parcel_description}
                onChange={(e) => update('parcel_description', e.target.value)}
              />
            </Field>

            {isTiered && (
              <div className="mb-4">
                <span className="block text-sm font-medium mb-2">Size</span>
                {tiers.length === 0 && (
                  <p className="text-sm text-[color:var(--consumer-muted)]">
                    No sizes are set up yet — please check back shortly.
                  </p>
                )}
                <div className="space-y-2">
                  {tiers.map((tier) => (
                    <button
                      key={tier.key}
                      type="button"
                      onClick={() => update('parcel_size', tier.key)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-colors ${
                        form.parcel_size === tier.key
                          ? 'border-[color:var(--consumer-accent)] bg-[color:var(--consumer-accent)]/5'
                          : 'border-[color:var(--consumer-line)]'
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-medium">
                          {tier.label ?? tier.key}
                        </span>
                        {(tier.max_weight_kg || tier.max_items) && (
                          <span className="block text-xs text-[color:var(--consumer-muted)]">
                            {tier.max_weight_kg ? `Up to ${tier.max_weight_kg}kg` : ''}
                            {tier.max_weight_kg && tier.max_items ? ' · ' : ''}
                            {tier.max_items ? `Up to ${tier.max_items} items` : ''}
                          </span>
                        )}
                      </span>
                      <span className="text-sm font-semibold">K{tier.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Field label="Weight in kg (optional)">
              <input
                type="number"
                min="0"
                step="0.1"
                className="consumer-input"
                value={form.parcel_weight_kg}
                onChange={(e) => update('parcel_weight_kg', e.target.value)}
              />
            </Field>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.parcel_fragile}
                onChange={(e) => update('parcel_fragile', e.target.checked)}
                className="accent-[color:var(--consumer-accent)]"
              />
              This is fragile
            </label>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-lg font-semibold mb-4">Check the details</h2>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-[color:var(--consumer-muted)] mb-1">
                  Collect from
                </p>
                <p className="font-medium">{form.pickup_name}</p>
                <p className="text-[color:var(--consumer-muted)]">
                  {form.pickup_phone}
                </p>
                <p className="text-[color:var(--consumer-muted)]">
                  {form.pickup_address}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-[color:var(--consumer-muted)] mb-1">
                  Deliver to
                </p>
                <p className="font-medium">{form.dropoff_name}</p>
                <p className="text-[color:var(--consumer-muted)]">
                  {form.dropoff_phone}
                </p>
                <p className="text-[color:var(--consumer-muted)]">
                  {form.dropoff_address}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-[color:var(--consumer-muted)] mb-1">
                  Parcel
                </p>
                <p>
                  {form.parcel_description}
                  {form.parcel_weight_kg ? ` · ${form.parcel_weight_kg}kg` : ''}
                  {form.parcel_fragile ? ' · fragile' : ''}
                </p>
                {selectedTier && (
                  <p className="text-[color:var(--consumer-muted)]">
                    {selectedTier.label ?? selectedTier.key}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-[color:var(--consumer-line)]">
              <span className="text-sm font-medium">Delivery fee</span>
              <span className="text-lg font-semibold">
                {fee != null ? `K${fee}` : '—'}
              </span>
            </div>

            {/* Honest about the current state rather than implying a
                payment step exists. Remove once the gate is in. */}
            <p className="text-xs text-[color:var(--consumer-muted)] mt-3">
              Payment isn&apos;t set up yet — you&apos;ll settle this directly
              with the rider for now.
            </p>
          </>
        )}

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        <div className="mt-5">
          {step < 3 ? (
            <button onClick={next} className="consumer-btn">
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="consumer-btn flex items-center justify-center gap-2"
            >
              {submitting ? (
                'Booking…'
              ) : (
                <>
                  <Check size={16} /> Book this delivery
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}