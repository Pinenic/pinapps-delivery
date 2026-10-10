// The one place a Bearer token becomes a user. Every route reaches it
// through withAuth (lib/api/withAuth.js) — don't copy this into routes.
import { createServiceClient } from "@/lib/supabase/serviceClient";

let verifier;
function getVerifier() {
  return (verifier ??= createServiceClient());
}

export async function getAuthUser(request) {
  // 1. Extract Authorization header from incoming request
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  // 2. Extract JWT token (remove "Bearer ")
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  // 3. Ask Supabase to verify the JWT and return the user it belongs to
  const {
    data: { user },
    error,
  } = await getVerifier().auth.getUser(token);

  if (error || !user) return null;
  return user;
}
