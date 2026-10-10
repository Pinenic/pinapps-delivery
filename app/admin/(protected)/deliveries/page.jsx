import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/ui/StatusBadge";
import SourceBadge from "@/components/ui/SourceBadge";
import DeliveryFilters from "@/components/DeliveryFilters";

export const metadata = {
  title: "Deliveries",
};

const PAGE_SIZE = 20;

// A hand-edited ?dateFrom=garbage used to throw RangeError and take the
// whole page down; an unparseable date is now just ignored.
const validDate = (value) =>
  value && !Number.isNaN(new Date(value).getTime()) ? value : null;

function buildHref(params, page) {
  const sp = new URLSearchParams(params);
  if (page > 1) {
    sp.set("page", String(page));
  } else {
    sp.delete("page");
  }
  const qs = sp.toString();
  return `/admin/deliveries${qs ? `?${qs}` : ""}`;
}

export default async function DeliveriesPage({ searchParams }) {
  const params = await searchParams;
  const status = params.status || null;
  const source = params.source || null;
  const dateFrom = validDate(params.dateFrom);
  const dateTo = validDate(params.dateTo);
  const page = Math.max(1, parseInt(params.page) || 1);

  const supabase = await createClient();

  let query = supabase
    .from("delivery_orders")
    .select(
      "id, pickup_name, dropoff_name, status, delivery_fee, created_at, source, riders(name), clients(name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (source) query = query.eq("source", source);
  if (dateFrom) query = query.gte("created_at", new Date(dateFrom).toISOString());
  if (dateTo) {
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);
    query = query.lte("created_at", end.toISOString());
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data: orders, count, error } = await query;
  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-display text-xl font-semibold">Deliveries</h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          {count ?? 0} total
        </p>
      </div>

      <DeliveryFilters />

      {error && (
        <p className="text-sm text-red-600 mb-4">
          Couldn&apos;t load deliveries: {error.message}
        </p>
      )}

      {orders?.length === 0 && (
        <div className="glass-card-solid p-8 text-center text-[color:var(--color-muted)]">
          No deliveries match these filters.
        </div>
      )}

      {/* Table — md and up */}
      {orders?.length > 0 && (
        <div className="hidden md:block glass-card-solid overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-[color:var(--color-muted)] text-left border-b border-[color:var(--color-border)]">
                <th className="font-normal px-4 py-3">Order</th>
                <th className="font-normal px-4 py-3">Customer</th>
                <th className="font-normal px-4 py-3">Source</th>
                <th className="font-normal px-4 py-3">Rider</th>
                <th className="font-normal px-4 py-3">Status</th>
                <th className="font-normal px-4 py-3">Fee</th>
                <th className="font-normal px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[color:var(--color-border)] last:border-0 hover:bg-black/[0.02]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/deliveries/${order.id}`}
                      className="font-mono-tracking text-xs text-[color:var(--color-primary-dark)]"
                    >
                      #{order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.dropoff_name}</td>
                  <td className="px-4 py-3">
                    <SourceBadge source={order.source} clientName={order.clients?.name} />
                  </td>
                  <td className="px-4 py-3 text-[color:var(--color-muted)]">
                    {order.riders?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    {order.delivery_fee ? `K${order.delivery_fee}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-[color:var(--color-muted)]">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards — below md. */}
      {orders?.length > 0 && (
        <div className="md:hidden space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/deliveries/${order.id}`}
              className="block glass-card-solid p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono-tracking text-xs text-[color:var(--color-primary-dark)]">
                  #{order.id.slice(0, 8)}
                </span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{order.dropoff_name}</p>
                <SourceBadge source={order.source} clientName={order.clients?.name} />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-[color:var(--color-muted)]">
                <span>{order.riders?.name || "Unassigned"}</span>
                <span>{order.delivery_fee ? `K${order.delivery_fee}` : "—"}</span>
              </div>
              <p className="text-[11px] text-[color:var(--color-muted)] mt-1">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          {page > 1 ? (
            <Link
              href={buildHref(params, page - 1)}
              className="flex items-center gap-1 text-sm text-[color:var(--color-primary-dark)]"
            >
              <ChevronLeft size={14} /> Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-xs text-[color:var(--color-muted)]">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={buildHref(params, page + 1)}
              className="flex items-center gap-1 text-sm text-[color:var(--color-primary-dark)]"
            >
              Next <ChevronRight size={14} />
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}