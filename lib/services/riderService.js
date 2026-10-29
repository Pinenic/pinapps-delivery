// Rider-facing calls. Token comes from the auth store (rider sessions).
import { useAuthStore } from "@/lib/store/authStore";
import { apiFetch } from "./apiClient";

const BASE = "/api/v1/rider";
const token = () => useAuthStore.getState().session?.access_token;

export async function getRiderProfile() {
console.log(token());
  return (await apiFetch(`${BASE}/profile`, { token: token() })).data;
}

// updates: { name?, phone?, vehicle_type?, avatar_url? }
export async function updateRiderProfile(updates) {
  return (
    await apiFetch(`${BASE}/profile`, {
      method: "PATCH",
      body: updates,
      token: token(),
    })
  ).data;
}

// scope: 'all' | 'active' | 'completed'
export async function listMyOrders(scope = "all") {
  return (
    await apiFetch(`${BASE}/orders`, { query: { scope }, token: token() })
  ).data;
}

export async function listOpenJobs() {
  return (await apiFetch(`${BASE}/jobs`, { token: token() })).data;
}

// -> { order, is_mine, is_open, status_log }
export async function getJob(id) {
  return (
    await apiFetch(`${BASE}/jobs/${encodeURIComponent(id)}`, { token: token() })
  ).data;
}

// -> { id, warning? }. Throws with status 409 if someone else got it first.
export async function claimJob(id) {
  return (
    await apiFetch(`${BASE}/jobs/${encodeURIComponent(id)}/claim`, {
      method: "POST",
      token: token(),
    })
  ).data;
}

// `from` is the status the screen is showing; the server rejects the call
// (409) if the job has moved on, and works out the next status itself.
// -> { id, status, warning? }
export async function advanceStatus(id, from) {
  return (
    await apiFetch(`${BASE}/orders/${encodeURIComponent(id)}/status`, {
      method: "POST",
      body: { from },
      token: token(),
    })
  ).data;
}
