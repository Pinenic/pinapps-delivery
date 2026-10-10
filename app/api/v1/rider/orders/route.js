// app/api/v1/rider/orders/route.js
import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/ApiError";
import { withRider } from "@/lib/api/guards";
import { listRiderOrders } from "@/lib/db/riderDb";

const SCOPES = ["all", "active", "completed"];

/**
 * @swagger
 * /api/v1/rider/orders:
 *   get:
 *     summary: List the rider's own jobs
 *     tags: [Rider]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: scope
 *         schema: { type: string, enum: [all, active, completed], default: all }
 *     responses:
 *       200: { description: "{ data: [orders with parcels] }" }
 *       400: { description: Invalid scope }
 *       401: { description: Unauthorized }
 */
export const GET = withRider(async ({ request, user }) => {
  const scope = new URL(request.url).searchParams.get("scope") ?? "all";
  if (!SCOPES.includes(scope)) {
    throw new ApiError(`scope must be one of: ${SCOPES.join(", ")}`, 400);
  }
  const data = await listRiderOrders(user.id, scope);
  return NextResponse.json({ data });
});
