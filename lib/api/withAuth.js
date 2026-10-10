// Wraps a route handler so it only runs for a verified Bearer token,
// and so every failure maps to JSON with the right status:
//
//   export const GET = withAuth(async ({ request, user, params }) => {
//     const data = await getThings(user.id);
//     return NextResponse.json({ data });
//   });
//
// `guard` (optional) runs after auth and before the handler — use it
// for role checks (see lib/api/guards.js). It should throw ApiError(403).
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { ApiError } from "./ApiError";

export function errorResponse(error) {
  const status = Number.isInteger(error?.status) ? error.status : 500;
  const body = { error: error?.message ?? "Something went wrong" };
  if (error?.tiers) body.tiers = error.tiers; // fee-calc errors list valid sizes
  return NextResponse.json(body, { status });
}

export function withAuth(handler, { guard } = {}) {
  return async (request, context) => {
    try {
      const user = await getAuthUser(request);
      if (!user) {
        return NextResponse.json({ error: "Not signed in" }, { status: 401 });
      }
      if (guard) await guard(user);

      const params = context?.params ? await context.params : {};
      return await handler({ request, user, params });
    } catch (error) {
      return errorResponse(error);
    }
  };
}

export async function readJson(request) {
  try {
    return (await request.json()) ?? {};
  } catch {
    throw new ApiError("Invalid JSON body", 400);
  }
}
