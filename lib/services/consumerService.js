// Consumer profile calls. Token comes from the consumer store.
import { useConsumerStore } from "@/lib/store/consumerStore";
import { apiFetch } from "./apiClient";

const BASE = "/api/v1/consumer/profile";
const token = () => useConsumerStore.getState().session?.access_token;

export async function getProfile() {
  return (await apiFetch(BASE, { token: token() })).data;
}

// updates: { name?, phone? } — phone is normalized/validated server-side.
export async function updateProfile(updates) {
  return (await apiFetch(BASE, { method: "PATCH", body: updates, token: token() })).data;
}
