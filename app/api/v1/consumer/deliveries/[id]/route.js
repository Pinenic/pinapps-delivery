// app/api/v1/consumer/deliveries/[id]/route.js
import { NextResponse } from "next/server";
import { withConsumer } from "@/lib/api/guards";
import { getConsumerOrder } from "@/lib/db/consumerDb";

/**
 * @swagger
 * /api/v1/consumer/deliveries/{id}:
 *   get:
 *     summary: Get one of the consumer's own orders
 *     description: Returns the order with its parcels, plus the assigned rider's name and phone (or null).
 *     tags: [Deliveries]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200: { description: "{ data: { order, rider } }" }
 *       401: { description: Unauthorized }
 *       404: { description: Order not found (or not the caller's) }
 */
export const GET = withConsumer(async ({ user, params }) => {
  const data = await getConsumerOrder(user.id, params.id);
  return NextResponse.json({ data });
});
