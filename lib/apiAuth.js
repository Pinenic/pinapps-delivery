// Validates the x-api-key header against clients.api_key.
// Returns { client, error: null } on success, or
// { client: null, error: { status, message } } on failure —
// callers just check `if (error)` and return it directly as JSON.
import { createServiceClient } from './supabase/serviceClient'

export async function authenticateClient(request) {
  const apiKey = request.headers.get('x-api-key')

  if (!apiKey) {
    return {
      client: null,
      error: { status: 401, message: 'Missing x-api-key header' },
    }
  }

  const supabase = createServiceClient()

  const { data: client, error } = await supabase
    .from('clients')
    .select('id, name, default_zone, fee_rule')
    .eq('api_key', apiKey)
    .maybeSingle()

  if (error) {
    return {
      client: null,
      error: { status: 500, message: 'Could not verify API key' },
    }
  }

  if (!client) {
    return {
      client: null,
      error: { status: 401, message: 'Invalid API key' },
    }
  }

  return { client, error: null }
}
