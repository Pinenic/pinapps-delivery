// Order creation for both entry points:
//   createDeliveryOrder        — a signed-in consumer (app/api/v1/consumer/deliveries)
//   createClientDeliveryOrder  — a business client with an API key (app/api/v1/deliveries)
//
// Both end in one database call (app_create_delivery_order) that inserts the
// order and its parcel in a single transaction, so there is no "order saved,
// parcel failed" state. Service-role client: the routes authorise the caller
// before anything here runs.
//
// The fee is calculated here in JS (lib/calculateFee.js — the same code the
// booking screen uses) so the pricing rules live in one place, then passed in.
import { ApiError } from "../api/ApiError";
import { calculateDeliveryFee } from "../calculateFee";
import { callRpc, envInt, serviceDb } from "./rpc";

// Kept for existing imports; behaves like ApiError.
export class DeliveryError extends ApiError {
  constructor(message, status = 500, extra = {}) {
    super(message, status, extra);
    this.name = "DeliveryError";
  }
}

// Consumer orders belong to a dedicated internal `clients` row (no
// webhook_url), NOT to a business client like Corn Mart — otherwise that
// client's webhook and API key would see consumer orders. Set
// CONSUMER_CLIENT_ID to that row's id (see .env.example).
function consumerClientId() {
  const id = process.env.CONSUMER_CLIENT_ID;
  if (!id) {
    console.error("CONSUMER_CLIENT_ID is not set; cannot create consumer orders");
    throw new DeliveryError("Ordering is temporarily unavailable", 500);
  }
  return id;
}

// Confirms the authenticated user has a consumer profile.
export async function getConsumerProfile(userId) {
  const { data, error } = await serviceDb()
    .from("consumers")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!data) {
    console.error("No consumer profile", error, userId);
    throw new DeliveryError("No consumer profile for this account", 403);
  }

  return data;
}

const REQUIRED = [
  "pickup_name",
  "pickup_phone",
  "pickup_address",
  "dropoff_name",
  "dropoff_phone",
  "dropoff_address",
  "parcel_description",
];

const text = (v, max = 300) => String(v ?? "").trim().slice(0, max);

function parcelWeight(body) {
  if (body.parcel_weight_kg == null || body.parcel_weight_kg === "") return null;
  const n = Number(body.parcel_weight_kg);
  if (!Number.isFinite(n) || n < 0) {
    throw new ApiError("parcel_weight_kg must be a non-negative number", 400);
  }
  return n;
}

async function submitOrder({ source, clientId, consumerId, feeRule, body, maxOpen }) {
  const missing = REQUIRED.filter((k) => !text(body?.[k]));
  if (missing.length) {
    throw new ApiError(`Missing required field(s): ${missing.join(", ")}`, 400);
  }

  const { fee, error: feeError, tiers } = calculateDeliveryFee(feeRule, {
    parcelSize: body.parcel_size,
  });
  if (feeError) throw new ApiError(feeError, 400, { tiers });

  return callRpc("app_create_delivery_order", {
    p_order: {
      source,
      client_id: clientId,
      consumer_id: consumerId ?? null,
      external_reference:
        source === "api" ? text(body.external_reference, 200) || null : null,
      pickup_name: text(body.pickup_name),
      pickup_phone: text(body.pickup_phone, 40),
      pickup_address: text(body.pickup_address, 500),
      dropoff_name: text(body.dropoff_name),
      dropoff_phone: text(body.dropoff_phone, 40),
      dropoff_address: text(body.dropoff_address, 500),
      delivery_fee: fee,
      parcel_size: text(body.parcel_size, 60) || null,
    },
    p_parcel: {
      description: text(body.parcel_description, 500),
      weight_kg: parcelWeight(body),
      fragile: Boolean(body.parcel_fragile),
    },
    p_max_open: maxOpen ?? null,
  });
}

// ⚠️ TEMPORARY, PRE-PAYMENT SHAPE: the order is created immediately on
// submit. When payment lands, verify the payment reference before calling
// submitOrder, set payment_status on insert, and write the matching
// payment_transactions row (ideally inside the same database function).
//
// CONSUMER_MAX_OPEN_ORDERS (optional, positive integer) caps how many open
// orders one consumer can have; unset means no cap.
export async function createDeliveryOrder(userId, body) {
  const { data: pricing, error: pricingError } = await serviceDb()
    .from("platform_pricing")
    .select("fee_rule")
    .maybeSingle();

  if (pricingError) {
    console.error("platform_pricing lookup failed", pricingError);
    throw new DeliveryError("Could not load pricing. Please try again.", 500);
  }

  return submitOrder({
    source: "consumer",
    clientId: consumerClientId(),
    consumerId: userId,
    feeRule: pricing?.fee_rule,
    body,
    maxOpen: envInt("CONSUMER_MAX_OPEN_ORDERS"),
  });
}

// `client` is the row returned by authenticateClient (id, fee_rule, …).
// Retrying with the same external_reference returns the original delivery
// with `duplicate: true` instead of creating a second one.
export async function createClientDeliveryOrder(client, body) {
  return submitOrder({
    source: "api",
    clientId: client.id,
    consumerId: null,
    feeRule: client.fee_rule,
    body,
    maxOpen: null,
  });
}