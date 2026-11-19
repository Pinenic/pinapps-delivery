import { NextResponse } from "next/server";

import { withConsumer } from "@/lib/api/guards";
import { getConsumerRiderLocation } from "@/lib/db/consumerDb";

/**
 * @swagger
 * /api/v1/consumer/deliveries/{id}/location:
 *   get:
 *     summary: Get the latest rider location for a consumer's delivery
 *     tags: [Deliveries]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Latest rider location, or null if not available
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found or not owned by consumer
 */
export const GET = withConsumer(async ({ user, params }) => {
  const data = await getConsumerRiderLocation(user.id, params.id);

  return NextResponse.json(
    { data },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
});