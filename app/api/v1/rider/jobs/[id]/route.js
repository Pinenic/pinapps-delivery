// app/api/v1/rider/jobs/[id]/route.js
import { NextResponse } from "next/server";
import { withRider } from "@/lib/api/guards";
import { getJob } from "@/lib/db/riderDb";

/**
 * @swagger
 * /api/v1/rider/jobs/{id}:
 *   get:
 *     summary: Get a job (open, or one of the rider's own)
 *     description: Returns the order + parcels, is_mine / is_open flags, and the status history when the job is the rider's own.
 *     tags: [Rider]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200: { description: "{ data: { order, is_mine, is_open, status_log } }" }
 *       401: { description: Unauthorized }
 *       404: { description: Not available (claimed by someone else, or doesn't exist) }
 */
export const GET = withRider(async ({ user, params }) => {
  const data = await getJob(user.id, params.id);
  return NextResponse.json({ data });
});
