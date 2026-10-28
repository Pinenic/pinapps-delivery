
import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/ApiError";
import { withRider } from "@/lib/api/guards";
import { getRiderStatistics } from "@/lib/db/riderDb";

const PERIODS = ["today", "week", "month"];

/**
 * @swagger
 * /api/v1/rider/statistics:
 *   get:
 *     summary: Get statistics for the authenticated rider
 *     tags: [Rider]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month]
 *           default: today
 *     responses:
 *       200:
 *         description: Rider statistics retrieved successfully
 *       400:
 *         description: Invalid reporting period
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to retrieve rider statistics
 */
export const GET = withRider(async ({ request, user }) => {
  const period =
    new URL(request.url).searchParams.get("period") ?? "today";

  if (!PERIODS.includes(period)) {
    throw new ApiError(
      `period must be one of: ${PERIODS.join(", ")}`,
      400
    );
  }

  const data = await getRiderStatistics(user.id, period);

  return NextResponse.json({ data });
});
