"use client";

// Client view for /orders. Loads through deliveryService (Bearer token
// -> consumer API) instead of a cookie-based server read.
import Link from "next/link";
import { useConsumerStore } from "@/lib/store/consumerStore";
import { listDeliveries } from "@/lib/services/bookingService";
import { useApiData, useRealtimeRefetch } from "@/lib/hooks/useApiData";

const STATUS_LABELS = {
  pending: "Booked",
  assigned: "Rider assigned",
  picked_up: "Picked up",
  in_transit: "In transit",
  delivered: "Delivered",
  failed: "Failed",
  cancelled: "Cancelled",
};

const LIVE = new Set(["assigned", "picked_up", "in_transit"]);

export default function OrdersView() {
  const user = useConsumerStore((s) => s.user);
  const ready = useConsumerStore((s) => !!s.session);
  const {
    data: orders,
    error,
    loading,
    refetch,
  } = useApiData(listDeliveries, {
    enabled: ready,
  });
  useRealtimeRefetch(
    "delivery_orders",
    user ? `consumer_id=eq.${user.id}` : null,
    refetch,
    ready
  );

  if (loading) {
    return (
      <p className="text-sm text-[color:var(--consumer-muted)]">Loading…</p>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Your orders</h1>
      <p className="text-sm text-[color:var(--consumer-muted)] mb-6">
        Everything you&apos;ve sent, and where it is right now.
      </p>

      {error && (
        <p className="text-sm text-red-600 mb-4">
          Couldn&apos;t load your orders: {error.message}
        </p>
      )}

      {orders?.length === 0 && (
        <div className="consumer-card p-8 text-center">
          <p className="text-sm text-[color:var(--consumer-muted)] mb-3">
            Nothing sent yet.
          </p>
          <Link
            href="/book"
            className="text-sm font-medium text-[color:var(--consumer-accent)]"
          >
            Send your first package
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {orders?.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block consumer-card p-4"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">{order.dropoff_name}</span>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={
                  LIVE.has(order.status)
                    ? {
                        backgroundColor: "rgba(255,107,0,0.12)",
                        color: "var(--consumer-live)",
                      }
                    : {
                        backgroundColor: "rgba(17,24,39,0.06)",
                        color: "var(--consumer-muted)",
                      }
                }
              >
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <p className="text-xs text-[color:var(--consumer-muted)] truncate">
              {order.dropoff_address}
            </p>
            <div className="flex items-center justify-between mt-2 text-xs text-[color:var(--consumer-muted)]">
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
              <span>{order.delivery_fee ? `K${order.delivery_fee}` : "—"}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
