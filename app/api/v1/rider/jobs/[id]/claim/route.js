// app/api/v1/rider/jobs/[id]/claim/route.js
import { NextResponse } from "next/server";
import { withRider } from "@/lib/api/guards";
import { claimJob } from "@/lib/db/riderDb";

/**
 * @swagger
 * /api/v1/rider/jobs/{id}/claim:
 *   post:
 *     summary: Claim an open job
 *     description: Race-safe — succeeds only if the job is still pending and unassigned.
 *     tags: [Rider]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200: { description: "{ data: { id, warning? } }" }
 *       401: { description: Unauthorized }
 *       409: { description: Someone else just claimed this job }
 */
export const POST = withRider(async ({ user, params }) => {
  const data = await claimJob(user.id, params.id);
  return NextResponse.json({ data });
});
