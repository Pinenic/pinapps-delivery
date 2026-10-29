// DB layer for the consumer side: profile + reading their own orders.
// Uses the service-role client, which BYPASSES RLS — so every query
// here must scope by the user id itself. That scoping is the security
// boundary now; don't add a query without it.
// import supabaseAdmin from "../supabase/admin";
import { ApiError } from "../api/ApiError";
import { createServiceClient } from "../supabase/serviceClient";

const supabaseAdmin = createServiceClient();
const PROFILE_FIELDS = "id, name, phone, email, created_at";
const ORDER_FIELDS =
  "id, pickup_name, pickup_address, dropoff_name, dropoff_address, status, delivery_fee, created_at, parcels(description, weight_kg, fragile)";
const BAD_UUID = "22P02"; // Postgres: invalid input syntax for type uuid

export async function getConsumer(userId) {
  const { data, error } = await supabaseAdmin
    .from("consumers")
    .select(PROFILE_FIELDS)
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new ApiError(error.message);
  if (!data) throw new ApiError("No consumer profile for this account", 403);
  return data;
}

// Only name and phone are editable — a whitelist, so a crafted body
// can't touch any other column on the row.
export async function updateConsumer(userId, updates) {
  const clean = {};
  if (updates.name !== undefined) clean.name = updates.name;
  if (updates.phone !== undefined) clean.phone = updates.phone;
  if (Object.keys(clean).length === 0) {
    throw new ApiError("Nothing to update", 400);
  }

  const { data, error } = await supabaseAdmin
    .from("consumers")
    .update(clean)
    .eq("id", userId)
    .select(PROFILE_FIELDS)
    .single();

  if (error) throw new ApiError(error.message);
  return data;
}

export async function listConsumerOrders(userId) {
  const { data, error } = await supabaseAdmin
    .from("delivery_orders")
    .select(ORDER_FIELDS)
    .eq("consumer_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new ApiError(error.message);
  return data;
}

// One of the consumer's own orders, plus the assigned rider's name and
// number (the consumer needs those to contact whoever has the parcel —
// nothing else about the rider is exposed).
export async function getConsumerOrder(userId, orderId) {
  const { data: order, error } = await supabaseAdmin
    .from("delivery_orders")
    .select(ORDER_FIELDS)
    .eq("id", orderId)
    .eq("consumer_id", userId)
    .maybeSingle();

  if (error?.code === BAD_UUID) throw new ApiError("Order not found", 404);
  if (error) throw new ApiError(error.message);
  if (!order) throw new ApiError("Order not found", 404);

  let rider = null;
  if (order.rider_id) {
    const { data } = await supabaseAdmin
      .from("riders")
      .select("name, phone")
      .eq("id", order.rider_id)
      .maybeSingle();
    rider = data;
  }

  return { order, rider };
}
