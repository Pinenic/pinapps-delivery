// app/api/v1/rider/orders/[id]/status/route.js
import { NextResponse } from "next/server";
import { readJson } from "@/lib/api/withAuth";
import { withRider } from "@/lib/api/guards";
import { advanceDeliveryStatus } from "@/lib/db/riderDb";

/**
 * @swagger
 * /api/v1/rider/orders/{id}/status:
 *   post:
 *     summary: Advance one of the rider's own jobs to its next status
 *     description: The server decides the next status. `from` must match the job's current status, so a stale or double request can't skip a step.
 *     tags: [Rider]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [from]
 *             properties:
 *               from: { type: string, example: picked_up }
 *     responses:
 *       200: { description: "{ data: { id, status, warning? } }" }
 *       404: { description: Job not found (or not yours) }
 *       409: { description: Job already moved on, or can't be advanced }
 */
export const POST = withRider(async ({ request, user, params }) => {
  const { from } = await readJson(request);
  const data = await advanceDeliveryStatus(user.id, params.id, from);
  return NextResponse.json({ data });
});
