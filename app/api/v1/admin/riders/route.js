import { NextResponse } from "next/server";
import { readJson } from "@/lib/api/withAuth";
import { withAdmin } from "@/lib/api/guards";
import { createRider } from "@/lib/db/adminDb";

/**
 * @swagger
 * /api/v1/admin/riders:
 *   post:
 *     summary: Create a rider account (admin only)
 *     description: Creates the login with the supplied password and the riders row. status and rating are set server-side.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201: { description: "{ data: { id, name, phone, vehicle_type, status } }" }
 *       400: { description: Invalid input }
 *       401: { description: Unauthorized }
 *       403: { description: Admin access required }
 *       409: { description: Email already in use }
 */
export const POST = withAdmin(async ({ request }) => {
  const body = await readJson(request);
  const data = await createRider(body);
  return NextResponse.json({ data }, { status: 201 });
});
