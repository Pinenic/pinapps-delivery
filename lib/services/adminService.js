// Admin-facing calls. Token comes from the admin store (admin sessions) —
// never from the rider store.
import { useAdminStore } from "@/lib/store/adminStore";
import { apiFetch } from "./apiClient";

const BASE = "/api/v1/admin";
const token = () => useAdminStore.getState().session?.access_token;

// body: { name, email, password, phone, vehicle_type, license_no }
// -> { id, name, phone, vehicle_type, status }
export async function createRider(body) {
  return (
    await apiFetch(`${BASE}/riders`, { method: "POST", body, token: token() })
  ).data;
}

// -> { id, warning? }. Throws with status 409 if the delivery can no
// longer be assigned or changed while the request was in flight.
export async function assignRider(orderId, riderId) {
  return (
    await apiFetch(`${BASE}/deliveries/${encodeURIComponent(orderId)}/assign`, {
      method: "POST",
      body: { rider_id: riderId },
      token: token(),
    })
  ).data;
}
