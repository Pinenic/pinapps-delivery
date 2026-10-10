// DB layer for admin-only writes. Service-role client (bypasses RLS), so
// every function here MUST sit behind withAdmin (lib/api/guards.js) —
// that guard is the trust boundary for this file.
//
//   createRider  — creates the auth user AND the riders row on the server,
//                  with the password the admin actually typed.
//   assignRider  — assigns / reassigns a rider, validated and logged.
import { ApiError } from "../api/ApiError";
import { createServiceClient } from "../supabase/serviceClient";
import { normalizeZambianPhone } from "../phone";
import { callRpc, isUuid } from "./rpc";

let client;
const db = () => (client ??= createServiceClient());

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

export async function requireAdmin(userId) {
  const { data, error } = await db()
    .from("admins")
    .select("id, name")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("requireAdmin lookup failed", error);
    throw new ApiError("Could not verify admin access", 500);
  }
  if (!data) throw new ApiError("Admin access required", 403);
  return data;
}

const clean = (v, max) => String(v ?? "").trim().slice(0, max);

export async function createRider(body) {
  const name = clean(body.name, 120);
  const email = clean(body.email, 254).toLowerCase();
  const vehicleType = clean(body.vehicle_type, 60);
  const licenseNo = clean(body.license_no, 60);
  const password = String(body.password ?? "");
  const phone = normalizeZambianPhone(body.phone);

  if (!name) throw new ApiError("Name is required", 400);
  if (!EMAIL_RE.test(email)) throw new ApiError("Enter a valid email address", 400);
  if (!phone) {
    throw new ApiError("Enter a valid Zambian phone number, e.g. +260977123456", 400);
  }
  if (password.length < MIN_PASSWORD) {
    throw new ApiError(`Password must be at least ${MIN_PASSWORD} characters`, 400);
  }
  if (!vehicleType) throw new ApiError("Vehicle type is required", 400);
  if (!licenseNo) throw new ApiError("License number is required", 400);

  // 1. The auth user, with the admin-chosen password. email_confirm: true
  //    because the admin is vouching for this address; the rider can log
  //    in straight away. Using the admin API means nothing touches the
  //    admin's own browser session.
  const { data: created, error: createError } = await db().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, phone },
  });

  if (createError || !created?.user) {
    const taken =
      createError?.code === "email_exists" ||
      /already.*(registered|exists)/i.test(createError?.message ?? "");
    if (taken) throw new ApiError("An account with this email already exists", 409);
    console.error("createRider: auth user creation failed", createError);
    throw new ApiError("Could not create the rider account", 500);
  }

  const userId = created.user.id;
  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    name
  )}&backgroundColor=c5c5c5&textColor=ffffff`;

  // 2. The riders row. status and rating are fixed here — never taken
  //    from the request body.
  const { data: rider, error: riderError } = await db()
    .from("riders")
    .insert({
      id: userId,
      name,
      phone,
      vehicle_type: vehicleType,
      license_no: licenseNo,
      status: "available",
      rating: 0,
      avatar_url: avatarUrl,
    })
    .select("id, name, phone, vehicle_type, status")
    .single();

  if (riderError) {
    // Don't leave an orphan login behind with no rider profile.
    console.error("createRider: riders insert failed", riderError);
    const { error: rollbackError } = await db().auth.admin.deleteUser(userId);
    if (rollbackError) {
      console.error("createRider: ROLLBACK FAILED, orphan auth user", userId, rollbackError);
    }
    throw new ApiError("Could not create the rider profile", 500);
  }

  return rider;
}

// Assigns (or reassigns) a rider (app_assign_rider). The database checks the
// order is still pending/assigned, locks the riders and the order, writes the
// order change and the audit-log row (with this admin's id) together, and
// refreshes both riders' availability. Any failure leaves nothing changed.
export async function assignRider(adminId, orderId, riderId) {
  if (!isUuid(riderId)) throw new ApiError("rider_id is required", 400);
  if (!isUuid(orderId)) throw new ApiError("Delivery not found", 404);
  return callRpc("app_assign_rider", {
    p_admin_id: adminId,
    p_order_id: orderId,
    p_rider_id: riderId,
  });
}
