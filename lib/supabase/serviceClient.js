// Server-only. Uses the service role key, which bypasses RLS entirely —
// never import this from a Client Component or expose the key to the
// browser (it must NOT be prefixed with NEXT_PUBLIC_).
//
// This is safe to use in the /api/v1 routes specifically because the
// route itself is the trust boundary: authenticateClient() validates
// the caller's API key before anything here touches the database.
// RLS is what protects the admin/rider UI; this is what protects the
// public API.
import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
