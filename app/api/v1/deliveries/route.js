// app/api/v1/deliveries/route.js
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
//   "parcel_fragile": false       // optional
// }
import { NextResponse } from 'next/server'
import { authenticateClient } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase/serviceClient'
import { calculateDeliveryFee } from '@/lib/calculateFee'

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

  const supabase = createServiceClient()
  const delivery_fee = calculateDeliveryFee(client.fee_rule)

  const { data: order, error: orderError } = await supabase
    .from('delivery_orders')
    .insert({
      client_id: client.id,
      external_reference: body.external_reference || null,
      pickup_name: body.pickup_name,
      pickup_phone: body.pickup_phone,
      pickup_address: body.pickup_address,
      dropoff_name: body.dropoff_name,
      dropoff_phone: body.dropoff_phone,
      dropoff_address: body.dropoff_address,
      delivery_fee,
    })
    .select('id, status, delivery_fee, created_at')
    .single()

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 })
  }

  const { error: parcelError } = await supabase.from('parcels').insert({
    delivery_order_id: order.id,
    description: body.parcel_description,
    weight_kg: body.parcel_weight_kg ?? null,
    fragile: Boolean(body.parcel_fragile),
  })

  if (parcelError) {
    // The order exists but the parcel failed to save — same "don't hide
    // a partial write" pattern used in the admin create-delivery form.
    return NextResponse.json(
      {
        id: order.id,
        status: order.status,
        delivery_fee: order.delivery_fee,
        created_at: order.created_at,
        warning: `Delivery created, but parcel details failed to save: ${parcelError.message}`,
      },
      { status: 201 }
    )
  }

  return NextResponse.json(
    {
      id: order.id,
      status: order.status,
      delivery_fee: order.delivery_fee,
      created_at: order.created_at,
    },
    { status: 201 }
  )
}
