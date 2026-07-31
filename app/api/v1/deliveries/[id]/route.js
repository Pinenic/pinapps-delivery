// app/api/v1/deliveries/[id]/route.js
// GET /api/v1/deliveries/:id
// Auth: x-api-key header (see lib/apiAuth.js)
import { NextResponse } from 'next/server'
import { authenticateClient } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase/serviceClient'

export async function GET(request, { params }) {
  const { client, error: authError } = await authenticateClient(request)
  if (authError) {
    return NextResponse.json(
      { error: authError.message },
      { status: authError.status }
    )
  }

  const { id } = await params
  const supabase = createServiceClient()

  const { data: order, error } = await supabase
    .from('delivery_orders')
    .select(
      'id, external_reference, status, delivery_fee, pickup_name, dropoff_name, created_at, updated_at, parcels(description, weight_kg, fragile)'
    )
    .eq('id', id)
    // Scoping: a client can only ever read their own deliveries, even
    // if they guess a valid delivery id belonging to someone else.
    .eq('client_id', client.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!order) {
    return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
  }

  return NextResponse.json(order)
}
