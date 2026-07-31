// app/admin/(protected)/page.jsx
import Link from "next/link";
import { Plus, User2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/ui/StatusBadge";
import RealtimeRefresher from "@/components/RealtimeRefresher";
import DashboardChart from "@/components/DashboardChart";

function KPI({ label, value }) {
  return (
    <div className="flex flex-col gap-2 min-w-xs shadow-xs p-4 px-5 rounded-3xl bg-white/50 backdrop-blur-md">
      <div className="flex font-medium text-sm">{label}</div>
      <div className="flex justify-between">
        <div className="text-xl">{value}</div>
        <div className="border-b-2 text-center px-2 font-medium">0.0%</div>
      </div>
      <p className="text-xs text-muted-foreground">vs last month</p>
    </div>
    // <div className="glass-card p-5">
    //   <p className="text-sm text-[color:var(--color-muted)] mb-2">{label}</p>
    //   <span className="font-display text-2xl font-semibold">{value}</span>
    // </div>
  );
}

function Leaderboard({ riders }) {
  return (
    <div className="glass-card p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display font-semibold text-sm">Top riders</h2>
        <Link
          href="/admin/riders"
          className="text-xs text-[color:var(--color-primary)] hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="space-y-4">
        {(!riders || riders.length === 0) && (
          <p className="text-sm text-[color:var(--color-muted)]">
            No riders yet.
          </p>
        )}
        {riders?.slice(0,2).map((rider) => (
          <div key={rider.id} className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <span className="flex items-center justify-center h-9 w-9 rounded-full bg-[color:var(--color-primary-pale)]">
                <User2
                  size={16}
                  className="text-[color:var(--color-primary-dark)]"
                />
              </span>
              <div>
                <p className="text-sm font-medium leading-tight">
                  {rider.name}
                </p>
                <p className="font-mono-tracking text-xs text-[color:var(--color-muted)]">
                  {rider.phone}
                </p>
              </div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[color:var(--color-success-pale)] text-[color:var(--color-success)] font-medium">
              {rider.rating}★
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("delivery_orders")
    .select(
      "id, pickup_name, dropoff_name, status, delivery_fee, created_at, riders(name)"
    )
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: topRiders } = await supabase
    .from("riders")
    .select("id, name, phone, rating")
    .order("rating", { ascending: false })
    .limit(3);

  const { data: allOrders } = await supabase
    .from("delivery_orders")
    .select("status, created_at");

  const total = allOrders?.length || 0;
  const active =
    allOrders?.filter((o) =>
      ["pending", "assigned", "picked_up", "in_transit"].includes(o.status)
    ).length || 0;
  const delivered =
    allOrders?.filter((o) => o.status === "delivered").length || 0;

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const chartData = days.map((d) => ({
    label: d.toLocaleDateString(undefined, { weekday: "short" }),
    count:
      allOrders?.filter(
        (o) => new Date(o.created_at).toDateString() === d.toDateString()
      ).length || 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      <RealtimeRefresher table="status_log" />

      <aside className="space-y-2">
        <div>
          <h1 className="font-display text-xl font-semibold">
            Welcome back, admin
          </h1>
          <p className="text-sm text-[color:var(--color-muted)]">
            Here&apos;s what&apos;s happening with your deliveries today.
          </p>
        </div>
        <KPI label="Total deliveries" value={total} />
        <KPI label="Active" value={active} />
        <KPI label="Delivered" value={delivered} />
        <Leaderboard riders={topRiders} />
      </aside>

      <section className="flex flex-col justify-between w-full">
        <div className="flex justify-end">
          <Link
            href="/admin/deliveries/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[color:var(--color-primary)] text-white text-sm font-medium hover:bg-[color:var(--color-primary-dark)] transition-colors"
          >
            <Plus size={16} /> Create delivery
          </Link>
        </div>

        <div className="flex justify-evenly">
          <div className="shadow-xs p-4 px-5 min-h-lg min-w-lg rounded-3xl bg-white/80 backdrop-blur-md">
            <h2 className="font-display font-semibold text-sm mb-2">
              Delivery volume — last 7 days
            </h2>
            <DashboardChart data={chartData} />
          </div>

          <div className="shadow-xs p-4 px-5 min-h-lg min-w-lg rounded-3xl bg-white/80 backdrop-blur-md">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-display font-semibold text-sm">
                Recent deliveries
              </h2>
            </div>

            {error && (
              <p className="text-sm text-red-600 mb-2">
                Couldn&apos;t load deliveries: {error.message}
              </p>
            )}

            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[color:var(--color-muted)] text-left border-b border-[color:var(--color-border)]">
                  <th className="font-normal py-2">Order</th>
                  <th className="font-normal py-2">Customer</th>
                  <th className="font-normal py-2">Rider</th>
                  <th className="font-normal py-2">Status</th>
                  <th className="font-normal py-2">Fee</th>
                </tr>
              </thead>
              <tbody>
                {orders?.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-[color:var(--color-muted)]"
                    >
                      No deliveries yet — create the first one above.
                    </td>
                  </tr>
                )}
                {orders?.slice(0,5).map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[color:var(--color-border)] last:border-0 hover:bg-black/[0.02]"
                  >
                    <td className="py-3">
                      <Link
                        href={`/admin/deliveries/${order.id}`}
                        className="font-mono-tracking text-xs text-[color:var(--color-primary-dark)]"
                      >
                        #{order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="py-3">{order.dropoff_name}</td>
                    <td className="py-3 text-[color:var(--color-muted)]">
                      {order.riders?.name || "—"}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3">
                      {order.delivery_fee ? `K${order.delivery_fee}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
