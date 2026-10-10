// app/api/v1/rider/profile/route.js
import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/ApiError";
import { readJson } from "@/lib/api/withAuth";
import { withRider } from "@/lib/api/guards";
import { getRiderProfile, updateRiderProfile } from "@/lib/db/riderDb";

/**
 * @swagger
 * /api/v1/rider/profile:
 *   get:
 *     summary: Get the signed-in rider's profile
 *     tags: [Rider]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200: { description: "{ data: { id, name, phone, vehicle_type, avatar_url, rating, status } }" }
 *       401: { description: Unauthorized }
 *       403: { description: No rider profile for this account }
 */
export const GET = withRider(async ({ user }) => {
  const data = await getRiderProfile(user.id);
  return NextResponse.json({ data });
});

/**
 * @swagger
 * /api/v1/rider/profile:
 *   patch:
 *     summary: Update name, phone, vehicle type and/or avatar URL
 *     tags: [Rider]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200: { description: Updated profile }
 *       400: { description: Invalid or empty update }
 *       401: { description: Unauthorized }
 */
export const PATCH = withRider(async ({ request, user }) => {
  const body = await readJson(request);

  if (body.name !== undefined && !String(body.name).trim()) {
    throw new ApiError("Name can't be empty", 400);
  }
  if (body.phone !== undefined && !String(body.phone).trim()) {
    throw new ApiError("Phone can't be empty", 400);
  }

  const data = await updateRiderProfile(user.id, {
    name: body.name?.trim?.() ?? body.name,
    phone: body.phone?.trim?.() ?? body.phone,
    vehicle_type: body.vehicle_type,
    avatar_url: body.avatar_url,
  });
  return NextResponse.json({ data });
});
