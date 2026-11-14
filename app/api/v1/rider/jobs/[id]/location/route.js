
import { NextResponse } from "next/server";

import { withRider } from "@/lib/api/guards";
import { ApiError } from "@/lib/api/ApiError";
import { saveRiderLocation } from "@/lib/db/riderDb";

function isValidOptionalNumber(value) {
  return value === undefined ||
    value === null ||
    (typeof value === "number" && Number.isFinite(value));
}

/**
 * @swagger
 * /api/v1/rider/jobs/{id}/location:
 *   post:
 *     summary: Update rider's live delivery location
 *     tags:
 *       - Rider
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *               - recordedAt
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               accuracy:
 *                 type: number
 *                 nullable: true
 *               heading:
 *                 type: number
 *                 nullable: true
 *               speed:
 *                 type: number
 *                 nullable: true
 *               recordedAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Location processed successfully
 *       400:
 *         description: Invalid location data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Delivery not found
 *       409:
 *         description: Delivery is not active
 */
export const POST = withRider(async ({ request, user }) => {
  // Extract the dynamic delivery ID from the request URL.
  const segments = new URL(request.url).pathname
    .split("/")
    .filter(Boolean);

  const jobId = segments[segments.length - 2];

  let body;

  try {
    body = await request.json();
  } catch {
    throw new ApiError("Invalid JSON request body", 400);
  }

  const {
    latitude,
    longitude,
    accuracy,
    heading,
    speed,
    recordedAt,
  } = body ?? {};

  // Required coordinate validation.
  if (
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    throw new ApiError("Invalid latitude", 400);
  }

  if (
    typeof longitude !== "number" ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new ApiError("Invalid longitude", 400);
  }

  // Optional GPS metadata validation.
  if (
    !isValidOptionalNumber(accuracy) ||
    (accuracy != null && accuracy < 0)
  ) {
    throw new ApiError("Invalid location accuracy", 400);
  }

  if (
    !isValidOptionalNumber(heading) ||
    (heading != null && (heading < 0 || heading >= 360))
  ) {
    throw new ApiError("Invalid heading", 400);
  }

  if (
    !isValidOptionalNumber(speed) ||
    (speed != null && speed < 0)
  ) {
    throw new ApiError("Invalid speed", 400);
  }

  // Validate the device's GPS timestamp.
  const timestamp = Date.parse(recordedAt);

  if (
    typeof recordedAt !== "string" ||
    !Number.isFinite(timestamp)
  ) {
    throw new ApiError("Invalid recordedAt timestamp", 400);
  }

  // Allow a small clock difference, but reject future readings.
  if (timestamp > Date.now() + 120_000) {
    throw new ApiError(
      "Location timestamp is too far in the future",
      400
    );
  }

  const data = await saveRiderLocation({
    riderId: user.id,
    jobId,
    latitude,
    longitude,
    accuracy: accuracy ?? null,
    heading: heading ?? null,
    speed: speed ?? null,
    recordedAt: new Date(timestamp).toISOString(),
  });

  return NextResponse.json({ data });
});
