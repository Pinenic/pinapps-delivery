// Consumer-facing delivery calls. Token comes from the consumer store.
import { useConsumerStore } from "@/lib/store/consumerStore";
import { apiFetch } from "./apiClient";

const BASE = "/api/v1/consumer/deliveries";
const token = () => useConsumerStore.getState().session?.access_token;

// POST returns the created order directly (not wrapped in { data }).
export const createDelivery = (deliveryData) =>
  apiFetch(BASE, { method: "POST", body: deliveryData, token: token() });

export async function listDeliveries() {
  return (await apiFetch(BASE, { token: token() })).data;
}

// -> { order, rider }
export async function getDelivery(id) {
  return (await apiFetch(`${BASE}/${encodeURIComponent(id)}`, { token: token() })).data;
}