// GET  — lists the signed-in consumer's orders.
// POST — creates a delivery order for them.
// Auth is a Bearer token (verified in withAuth), so the same endpoints
// serve the web app and the mobile app. All Supabase work lives in
// bookingDb.js / consumerDb.js; this file only validates the request
// shape and shapes the response.
import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/ApiError";
import { readJson } from "@/lib/api/withAuth";
import { withConsumer } from "@/lib/api/guards";
import { createDeliveryOrder } from "@/lib/db/bookingDb";
import { listConsumerOrders } from "@/lib/db/consumerDb";

const REQUIRED = [
  "pickup_name",
  "pickup_phone",
  "pickup_address",
  "dropoff_name",
  "dropoff_phone",
  "dropoff_address",
  "parcel_description",
];

/**
 * @swagger
 * /api/v1/consumer/deliveries:
 *   get:
 *     summary: List the consumer's own orders
 *     tags:
 *       - Deliveries
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: "{ data: [orders] }, newest first."
 *       401:
 *         description: Unauthorized - invalid or missing bearer token.
 *       403:
 *         description: No consumer profile for this account.
 */
export const GET = withConsumer(async ({ user }) => {
  const data = await listConsumerOrders(user.id);
  return NextResponse.json({ data });
});

/**
 * @swagger
 * /api/v1/consumer/deliveries:
 *   post:
 *     summary: Create a delivery order
 *     description: Creates a delivery order (plus its parcel row) for the authenticated consumer. Fee is resolved server-side.
 *     tags:
 *       - Deliveries
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pickup_name
 *               - pickup_phone
 *               - pickup_address
 *               - dropoff_name
 *               - dropoff_phone
 *               - dropoff_address
 *               - parcel_description
 *             properties:
 *               pickup_name: { type: string }
 *               pickup_phone: { type: string }
 *               pickup_address: { type: string }
 *               dropoff_name: { type: string }
 *               dropoff_phone: { type: string }
 *               dropoff_address: { type: string }
 *               parcel_description: { type: string }
 *               parcel_size: { type: string }
 *               parcel_weight_kg: { type: number }
 *               parcel_fragile: { type: boolean }
 *     responses:
 *       201:
 *         description: Order and parcel created together.
 *       400:
 *         description: Bad Request - missing fields or invalid parcel size.
 *       401:
 *         description: Unauthorized - invalid or missing bearer token.
 *       403:
 *         description: No consumer profile for this account.
 *       429:
 *         description: Too many open orders (only when CONSUMER_MAX_OPEN_ORDERS is set).
 *       500:
 *         description: Internal Server Error.
 */
export const POST = withConsumer(async ({ request, user }) => {
  const body = await readJson(request);

  const missing = REQUIRED.filter((f) => !body?.[f]);
  if (missing.length > 0) {
    throw new ApiError(`Missing required field(s): ${missing.join(", ")}`, 400);
  }

  // Identity comes from the verified token, never the payload — a
  // consumer_id in the body would be trivially spoofable.
  const order = await createDeliveryOrder(user.id, body);
  return NextResponse.json(order, { status: 201 });
});