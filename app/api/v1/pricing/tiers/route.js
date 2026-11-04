
import { getTiers } from "@/lib/db/pricingDb";
import { NextResponse } from "next/server";
// import { ApiError } from "@/lib/api/ApiError";
// import { withRider } from "@/lib/api/guards";

/**
 * @swagger
 * /api/v1/consumer/pricing-tiers:
 *   get:
 *     summary: List available pricing tiers or flat fees
 *     description: Fetches the current platform pricing rules (tiered or flat fee) to display to consumers.
 *     tags:
 *       - Pricing
 *     responses:
 *       200:
 *         description: List of pricing tiers or flat rate successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       key:
 *                         type: string
 *                       label:
 *                         type: string
 *                       price:
 *                         type: number
 *       500:
 *         description: Internal Server Error.
 */
export async function GET() {
    const data = await getTiers();
    return NextResponse.json({ data });
  }