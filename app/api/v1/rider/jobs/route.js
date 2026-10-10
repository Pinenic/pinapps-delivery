// app/api/v1/rider/jobs/route.js
import { NextResponse } from "next/server";
import { withRider } from "@/lib/api/guards";
import { listOpenJobs } from "@/lib/db/riderDb";

/**
 * @swagger
 * /api/v1/rider/jobs:
 *   get:
 *     summary: List open jobs (the job market)
 *     description: Pending, unassigned orders any rider can claim.
 *     tags: [Rider]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200: { description: "{ data: [orders with parcels] }" }
 *       401: { description: Unauthorized }
 */
export const GET = withRider(async () => {
  const data = await listOpenJobs();
  return NextResponse.json({ data });
});
