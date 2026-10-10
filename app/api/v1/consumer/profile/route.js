// app/api/v1/consumer/profile/route.js
import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/ApiError";
import { readJson } from "@/lib/api/withAuth";
import { withConsumer } from "@/lib/api/guards";
import { getConsumer, updateConsumer } from "@/lib/db/consumerDb";
import { normalizeZambianPhone } from "@/lib/phone";

/**
 * @swagger
 * /api/v1/consumer/profile:
 *   get:
 *     summary: Get the signed-in consumer's profile
 *     tags: [Consumer]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200: { description: "{ data: { id, name, phone, email, created_at } }" }
 *       401: { description: Unauthorized }
 *       403: { description: No consumer profile for this account }
 */
export const GET = withConsumer(async ({ user }) => {
  const data = await getConsumer(user.id);
  return NextResponse.json({ data });
});

/**
 * @swagger
 * /api/v1/consumer/profile:
 *   patch:
 *     summary: Update name and/or phone
 *     description: Phone is normalized to E.164; send null or "" to clear it.
 *     tags: [Consumer]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string, nullable: true }
 *     responses:
 *       200: { description: Updated profile }
 *       400: { description: Invalid name or phone }
 *       401: { description: Unauthorized }
 */
export const PATCH = withConsumer(async ({ request, user }) => {
  const body = await readJson(request);
  const updates = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) throw new ApiError("Name can't be empty", 400);
    updates.name = name;
  }

  if (body.phone !== undefined) {
    const raw = body.phone == null ? "" : String(body.phone).trim();
    if (!raw) {
      updates.phone = null;
    } else {
      const normalized = normalizeZambianPhone(raw);
      if (!normalized) {
        throw new ApiError("Enter a Zambian mobile number, like 097 123 4567.", 400);
      }
      updates.phone = normalized;
    }
  }

  const data = await updateConsumer(user.id, updates);
  return NextResponse.json({ data });
});
