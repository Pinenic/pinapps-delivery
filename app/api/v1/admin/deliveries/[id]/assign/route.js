import { NextResponse } from "next/server";
import { readJson } from "@/lib/api/withAuth";
import { withAdmin } from "@/lib/api/guards";
import { assignRider } from "@/lib/db/adminDb";

/**
 * @swagger
 * /api/v1/admin/deliveries/{id}/assign:
 *   post:
 *     summary: Assign or reassign a rider (admin only)
 *     description: Only pending or assigned deliveries. Writes the order change and the audit-log row together; reverts the order if the log write fails.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rider_id]
 *             properties:
 *               rider_id: { type: string }
 *     responses:
 *       200: { description: "{ data: { id, warning? } }" }
 *       403: { description: Admin access required }
 *       404: { description: Delivery or rider not found }
 *       409: { description: Delivery not assignable, or changed concurrently }
 */
export const POST = withAdmin(async ({ request, user, params }) => {
  const { rider_id } = await readJson(request);
  const data = await assignRider(user.id, params.id, rider_id);
  return NextResponse.json({ data });
});
