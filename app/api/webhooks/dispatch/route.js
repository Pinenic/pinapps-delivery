// app/api/webhooks/dispatch/route.js
// POST /api/webhooks/dispatch
//
// Called by a Supabase Database Webhook configured to fire on
// INSERT to status_log (see setup notes in chat — this is a
// dashboard config, not something set up in code). Looks up the
// delivery order's client, and if that client has a webhook_url,
// pushes the status change to it with one retry on failure.
//
// Auth: this endpoint is publicly reachable (Supabase's webhook
// sender isn't authenticated the way your own API routes are), so
// it checks a shared secret header instead — set the same value as
// WEBHOOK_DISPATCH_SECRET here and as a custom header on the
// Database Webhook config.
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/serviceClient'

const FETCH_TIMEOUT_MS = 8000
const RETRY_DELAY_MS = 2000

async function postWebhook(url, payload) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    console.log(res);
    return { ok: res.ok, status: res.status }
  } catch (err) {
    clearTimeout(timeout)
    return { ok: false, status: null, error: err.message }
  }
}

export async function POST(request) {
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.WEBHOOK_DISPATCH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const record = body?.record

  // Acknowledge anything that isn't the INSERT-on-status_log shape we
  // expect, rather than erroring — Supabase will keep retrying a
  // non-2xx response, and there's nothing to do with an unexpected
  // payload shape anyway.
  if (!record || body?.table !== 'status_log' || body?.type !== 'INSERT') {
    return NextResponse.json({ ignored: true })
  }

  const supabase = createServiceClient()

  const { data: order, error: orderError } = await supabase
    .from('delivery_orders')
    .select('id, client_id, external_reference')
    .eq('id', record.delivery_order_id)
    .maybeSingle()

  if (orderError || !order) {
    return NextResponse.json(
      { error: 'Delivery order not found' },
      { status: 404 }
    )
  }

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, webhook_url')
    .eq('id', order.client_id)
    .maybeSingle()

  if (clientError || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // No webhook configured for this client — nothing to push, nothing
  // to log as failed either. This is a normal/expected state, not an error.
  if (!client.webhook_url) {
    return NextResponse.json({ skipped: 'no webhook_url configured' })
  }

  const payload = {
    event: 'delivery.status_changed',
    delivery_id: order.id,
    external_reference: order.external_reference,
    status: record.status,
    changed_by_role: record.changed_by_role,
    changed_at: record.changed_at,
  }

  // Log the attempt before sending — so even a hard crash mid-request
  // leaves a record that something was supposed to go out.
  const { data: eventRow, error: insertError } = await supabase
    .from('webhook_events')
    .insert({
      client_id: client.id,
      delivery_order_id: order.id,
      delivery_status: record.status,
      payload,
    })
    .select('id')
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  let result = await postWebhook(client.webhook_url, payload)
  let attempts = 1

  if (!result.ok) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
    result = await postWebhook(client.webhook_url, payload)
    attempts = 2
  }

  // Whether it succeeded or both attempts failed, the outcome gets
  // recorded — a failed delivery isn't lost, just sitting in
  // webhook_events with delivered: false for later manual review
  // (a "retry failed webhooks" admin action is a natural next step,
  // not built this week).
  await supabase
    .from('webhook_events')
    .update({
      delivered: result.ok,
      attempts,
      last_attempted_at: new Date().toISOString(),
    })
    .eq('id', eventRow.id)

  return NextResponse.json({ delivered: result.ok, attempts })
}
