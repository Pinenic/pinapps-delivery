// app/api/v1/pricing/route.js
// GET /api/v1/pricing
// Auth: x-api-key header (see lib/apiAuth.js)
//
// Lets a client fetch its own pricing config — specifically, the
// tier list for 'tiered' clients — so their UI (e.g. Corn Mart's
// ship confirmation dialog) can render size options without
// duplicating that config on their own side. This keeps pricing
// single-sourced on the delivery platform: Corn Mart never stores
// or edits tier prices, only reads them.
import { NextResponse } from 'next/server'
import { authenticateClient } from '@/lib/apiAuth'

export async function GET(request) {
  const { client, error: authError } = await authenticateClient(request)
  if (authError) {
    return NextResponse.json(
      { error: authError.message },
      { status: authError.status }
    )
  }

  return NextResponse.json({ fee_rule: client.fee_rule })
}
