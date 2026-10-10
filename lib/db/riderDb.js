// DB layer for the rider side: profile, own jobs, the open job pool,
// job detail, and claiming. Service-role client (bypasses RLS), so the
// visibility rules RLS used to enforce are written out explicitly:
//   - a rider sees jobs that are open (pending, unassigned) or their own
//   - a rider can only edit their own name/phone/vehicle/avatar
// import supabaseAdmin from "../supabase/admin";
import { ApiError } from "../api/ApiError";
import { createServiceClient } from "../supabase/serviceClient";
import { callRpc, envInt, isUuid } from "./rpc";

const supabaseAdmin = createServiceClient();
const ORDER_FIELDS =
  "id, pickup_name, pickup_address, dropoff_name, dropoff_address, status, delivery_fee, created_at, parcels(description, weight_kg, fragile)";
const PROFILE_FIELDS =
  "id, name, phone, vehicle_type, avatar_url, rating, status";
const EDITABLE = ["name", "phone", "vehicle_type", "avatar_url"];
const DONE = ["delivered", "failed", "cancelled"];
const BAD_UUID = "22P02";

export async function requireRider(userId) {
  const { data, error } = await supabaseAdmin
    .from("riders")
    .select("id, name")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new ApiError(error.message);
  if (!data) throw new ApiError("No rider profile for this account", 403);
  return data;
}

export async function getRiderProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from("riders")
    .select(PROFILE_FIELDS)
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new ApiError(error.message);
  if (!data) throw new ApiError("Rider profile not found", 404);
  return data;
}

export async function updateRiderProfile(userId, updates) {
  // Whitelist: rating and status must never be writable from a request.
  const clean = Object.fromEntries(
    EDITABLE.filter((k) => updates?.[k] !== undefined).map((k) => [
      k,
      updates[k],
    ])
  );
  if (Object.keys(clean).length === 0) {
    throw new ApiError("Nothing to update", 400);
  }

  const { data, error } = await supabaseAdmin
    .from("riders")
    .update(clean)
    .eq("id", userId)
    .select(PROFILE_FIELDS)
    .single();

  if (error) throw new ApiError(error.message);
  return data;
}

// scope: 'all' | 'active' | 'completed'
export async function listRiderOrders(userId, scope = "all") {
  let query = supabaseAdmin
    .from("delivery_orders")
    .select(ORDER_FIELDS)
    .eq("rider_id", userId)
    .order("created_at", { ascending: false });

  if (scope === "active")
    query = query.not("status", "in", `(${DONE.join(",")})`);
  if (scope === "completed") query = query.in("status", DONE);

  const { data, error } = await query;
  if (error) throw new ApiError(error.message);
  return data;
}

export async function listOpenJobs() {
  const { data, error } = await supabaseAdmin
    .from("delivery_orders")
    .select(ORDER_FIELDS)
    .eq("status", "pending")
    .is("rider_id", null)
    .order("created_at", { ascending: false });

  if (error) throw new ApiError(error.message);
  return data;
}

export async function getJob(userId, jobId) {
  const { data: order, error } = await supabaseAdmin
    .from("delivery_orders")
    .select("*, parcels(*)")
    .eq("id", jobId)
    .maybeSingle();

  const unavailable = new ApiError(
    "This job isn't available — it may have been claimed by someone else or no longer exists.",
    404
  );
  if (error?.code === BAD_UUID) throw unavailable;
  if (error) throw new ApiError(error.message);

  const isMine = order?.rider_id === userId;
  const isOpen = !!order && order.status === "pending" && !order.rider_id;
  if (!order || (!isMine && !isOpen)) throw unavailable;

  let statusLog = null;
  if (isMine) {
    const { data, error: logError } = await supabaseAdmin
      .from("status_log")
      .select("*")
      .eq("delivery_order_id", jobId)
      .order("changed_at", { ascending: true });
    if (logError) throw new ApiError(logError.message);
    statusLog = data;
  }

  return { order, is_mine: isMine, is_open: isOpen, status_log: statusLog };
}

// Claiming runs as one database transaction (app_claim_job): the rider and
// the order are locked, the order must still be pending and unassigned,
// and the order update, the audit-log row and the rider's busy status are
// written together or not at all. Two riders can't both win (409).
//
// RIDER_MAX_ACTIVE_JOBS (optional, positive integer) caps how many active
// jobs one rider can hold; unset means no cap.
export async function claimJob(userId, jobId) {
  if (!isUuid(jobId)) throw new ApiError("Job not found", 404);
  return callRpc("app_claim_job", {
    p_rider_id: userId,
    p_order_id: jobId,
    p_max_active: envInt("RIDER_MAX_ACTIVE_JOBS"),
  });
}

// Moves one of the rider's own jobs to its next status (app_advance_delivery_status).
// The database decides what "next" means; `from` is the status the rider's
// screen was showing, and a mismatch is rejected (409) rather than skipping a
// step. The order update, the log row and the rider's availability are one
// transaction.
export async function advanceDeliveryStatus(userId, orderId, from) {
  if (!from || typeof from !== "string") {
    throw new ApiError("from (the current status) is required", 400);
  }
  if (!isUuid(orderId)) throw new ApiError("Job not found", 404);
  return callRpc("app_advance_delivery_status", {
    p_rider_id: userId,
    p_order_id: orderId,
    p_from: from,
  });
}