// app/admin/(protected)/deliveries/new/page.jsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Only one client exists right now (seeded by seed.js). Swap this for
// a client picker once a second business is actually onboarded.
const CORN_MART_CLIENT_NAME = 'Corn Mart'

const initialForm = {
  pickup_name: '',
  pickup_phone: '',
  pickup_address: '',
  dropoff_name: '',
  dropoff_phone: '',
  dropoff_address: '',
  parcel_description: '',
  parcel_weight_kg: '',
  fragile: false,
  delivery_fee: '',
}

function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-[#262620] mb-1">
        {label}
      </span>
      {children}
    </label>
  )
}

const inputClass =
  'w-full px-3 py-2 border border-[#E5E1D8] rounded-md text-sm bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 focus:border-[#D4A017]'

export default function NewDeliveryPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('name', CORN_MART_CLIENT_NAME)
      .single()

    if (clientError || !client) {
      setError(
        'Could not find the Corn Mart client record — has seed.js been run?'
      )
      setSubmitting(false)
      return
    }

    const { data: order, error: orderError } = await supabase
      .from('delivery_orders')
      .insert({
        client_id: client.id,
        pickup_name: form.pickup_name,
        pickup_phone: form.pickup_phone,
        pickup_address: form.pickup_address,
        dropoff_name: form.dropoff_name,
        dropoff_phone: form.dropoff_phone,
        dropoff_address: form.dropoff_address,
        delivery_fee: form.delivery_fee ? Number(form.delivery_fee) : null,
      })
      .select('id')
      .single()

    if (orderError) {
      setError(orderError.message)
      setSubmitting(false)
      return
    }

    const { error: parcelError } = await supabase.from('parcels').insert({
      delivery_order_id: order.id,
      description: form.parcel_description,
      weight_kg: form.parcel_weight_kg ? Number(form.parcel_weight_kg) : null,
      fragile: form.fragile,
    })

    setSubmitting(false)

    if (parcelError) {
      // The order exists but the parcel didn't save — surface this clearly
      // rather than silently losing the parcel details.
      setError(
        `Delivery was created, but the parcel details failed to save: ${parcelError.message}`
      )
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-[#6B6A61] hover:text-[#1E231C]"
        >
          ← Back to deliveries
        </Link>
        <h2 className="text-lg font-semibold text-[#262620] mt-2">
          New delivery
        </h2>
        <p className="text-sm text-[#6B6A61]">
          Manually create a delivery order for Corn Mart.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#E5E1D8] rounded-lg p-6"
      >
        <h3 className="text-sm font-semibold text-[#262620] mb-3">Pickup</h3>
        <Field label="Seller name">
          <input
            required
            className={inputClass}
            value={form.pickup_name}
            onChange={(e) => update('pickup_name', e.target.value)}
          />
        </Field>
        <Field label="Seller phone">
          <input
            required
            type="tel"
            placeholder="+2609XXXXXXXX"
            className={inputClass}
            value={form.pickup_phone}
            onChange={(e) => update('pickup_phone', e.target.value)}
          />
        </Field>
        <Field label="Pickup address">
          <input
            required
            className={inputClass}
            value={form.pickup_address}
            onChange={(e) => update('pickup_address', e.target.value)}
          />
        </Field>

        <hr className="my-5 border-[#EFECE4]" />

        <h3 className="text-sm font-semibold text-[#262620] mb-3">Dropoff</h3>
        <Field label="Buyer name">
          <input
            required
            className={inputClass}
            value={form.dropoff_name}
            onChange={(e) => update('dropoff_name', e.target.value)}
          />
        </Field>
        <Field label="Buyer phone">
          <input
            required
            type="tel"
            placeholder="+2609XXXXXXXX"
            className={inputClass}
            value={form.dropoff_phone}
            onChange={(e) => update('dropoff_phone', e.target.value)}
          />
        </Field>
        <Field label="Dropoff address">
          <input
            required
            className={inputClass}
            value={form.dropoff_address}
            onChange={(e) => update('dropoff_address', e.target.value)}
          />
        </Field>

        <hr className="my-5 border-[#EFECE4]" />

        <h3 className="text-sm font-semibold text-[#262620] mb-3">Parcel</h3>
        <Field label="Description">
          <input
            required
            placeholder="e.g. 10kg bag of mealie meal"
            className={inputClass}
            value={form.parcel_description}
            onChange={(e) => update('parcel_description', e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Weight (kg)">
            <input
              type="number"
              step="0.1"
              min="0"
              className={inputClass}
              value={form.parcel_weight_kg}
              onChange={(e) => update('parcel_weight_kg', e.target.value)}
            />
          </Field>
          <Field label="Delivery fee (K)">
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Optional"
              className={inputClass}
              value={form.delivery_fee}
              onChange={(e) => update('delivery_fee', e.target.value)}
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 mb-2 text-sm text-[#262620]">
          <input
            type="checkbox"
            checked={form.fragile}
            onChange={(e) => update('fragile', e.target.checked)}
            className="accent-[#D4A017]"
          />
          Fragile
        </label>

        {error && (
          <p className="text-sm text-red-600 mt-4" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#1E231C] text-white text-sm px-5 py-2 rounded-md hover:bg-[#D4A017] hover:text-[#1E231C] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create delivery'}
          </button>
          <Link
            href="/admin"
            className="text-sm text-[#6B6A61] hover:text-[#1E231C]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
