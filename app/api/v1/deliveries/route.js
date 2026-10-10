// POST /api/v1/deliveries
// Auth: x-api-key header (see lib/apiAuth.js)
//
// Body:
// {
//   "external_reference": "corn-mart-order-1234",   // optional, your own order id
//   "pickup_name": "...", "pickup_phone": "...", "pickup_address": "...",
//   "dropoff_name": "...", "dropoff_phone": "...", "dropoff_address": "...",
//   "parcel_description": "...",
//   "parcel_weight_kg": 5,        // optional
//   "parcel_fragile": false,      // optional
//   "parcel_size": "medium"       // required if this client's fee_rule.type is "tiered"
// }
//
// A repeated external_reference returns the original delivery with
// `duplicate: true` (HTTP 200) so retries are safe.
//
// If parcel_size is missing/invalid for a tiered client, responds 400
// with { error, tiers } — `tiers` lists the valid keys/labels/prices
// so the caller can render options without a separate lookup.
import { NextResponse } from 'next/server'
import { authenticateClient } from '@/lib/apiAuth'
import { createClientDeliveryOrder } from '@/lib/db/bookingDb'

const REQUIRED_FIELDS = [
  'pickup_name',
  'pickup_phone',
  'pickup_address',
  'dropoff_name',
  'dropoff_phone',
  'dropoff_address',
  'parcel_description',
]

function validatePayload(body) {
  const missing = REQUIRED_FIELDS.filter((field) => !body?.[field])
  if (missing.length > 0) {
    return `Missing required field(s): ${missing.join(', ')}`
  }
  return null
}

export async function POST(request) {
  const { client, error: authError } = await authenticateClient(request)
  if (authError) {
    return NextResponse.json(
      { error: authError.message },
      { status: authError.status }
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validationError = validatePayload(body)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  try {
    // One database transaction writes the order and its parcel. If the same
    // external_reference was already used by this client, the original
    // delivery is returned (200, duplicate: true) instead of a second one.
    const order = await createClientDeliveryOrder(client, body)
    return NextResponse.json(order, { status: order.duplicate ? 200 : 201 })
  } catch (err) {
    const status = Number.isInteger(err?.status) ? err.status : 500
    const payload = { error: status === 500 ? 'Something went wrong' : err.message }
    if (err?.tiers) payload.tiers = err.tiers
    return NextResponse.json(payload, { status })
  }
}