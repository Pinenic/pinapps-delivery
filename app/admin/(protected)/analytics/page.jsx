// app/admin/(protected)/analytics/page.jsx
import { createClient } from "@/lib/supabase/server";
import DashboardChart from "@/components/DashboardChart";
import { STATUS_LABELS } from "@/components/ui/StatusBadge";

export const metadata = {
  title: "Analytics",
};

const STATUS_COLORS = {
  pending: "bg-gray-300",
  assigned: "bg-blue-300",
  picked_up: "bg-amber-300",
  in_transit: "bg-amber-400",
  delivered: "bg-[color:var(--color-success)]",
  failed: "bg-[color:var(--color-primary)]",
  cancelled: "bg-gray-400",
};

function Stat({ label, value }) {
  // Deliberately plainer than the dashboard's KPI card (no "0.0% vs
  // last month" placeholder) — this page only shows numbers it can
  // actually back up. A fake trend indicator next to a real stat
  // would undercut the honesty of everything else here.
  return (
    <div className="glass-card p-5">
      <p className="text-sm text-[color:var(--color-muted)] mb-1">{label}</p>
      <p className="font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("delivery_orders")
    .select("status, delivery_fee, created_at");

  const total = orders?.length || 0;
  const delivered = orders?.filter((o) => o.status === "delivered").length || 0;
  const completionRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

  const feesCharged = orders?.filter((o) => o.delivery_fee != null) || [];
  const avgFee =
    feesCharged.length > 0
      ? (feesCharged.reduce((sum, o) => sum + Number(o.delivery_fee), 0) / feesCharged.length).toFixed(2)
      : null;

  const { count: riderCount } = await supabase
    .from("riders")
    .select("id", { count: "exact", head: true });

  const statusCounts = {};
  orders?.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });
  const maxStatusCount = Math.max(1, ...Object.values(statusCounts));

  // Last 30 days — a wider window than the dashboard's 7-day chart,
  // since this page's job is a slower-moving overview, not a daily
  // check-in.
  const days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d;
  });
  const chartData = days.map((d) => ({
    label: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
    count:
      orders?.filter(
        (o) => new Date(o.created_at).toDateString() === d.toDateString()
      ).length || 0,
  }));

  return (
    <div className="max-w-5xl">
      <div className="mb-5">
        <h1 className="font-display text-xl font-semibold">Analytics</h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          Early numbers — this gets more useful as delivery volume grows.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4">
          Couldn&apos;t load analytics: {error.message}
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label="Total deliveries" value={total} />
        <Stat label="Completion rate" value={total > 0 ? `${completionRate}%` : "—"} />
        <Stat label="Avg. delivery fee" value={avgFee ? `K${avgFee}` : "—"} />
        <Stat label="Riders on platform" value={riderCount ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="glass-card p-5">
          <h2 className="font-display font-semibold text-sm mb-3">
            Delivery volume — last 30 days
          </h2>
          {total === 0 ? (
            <p className="text-sm text-[color:var(--color-muted)] py-8 text-center">
              No deliveries yet — this fills in once orders start coming through.
            </p>
          ) : (
            <DashboardChart data={chartData} />
          )}
        </div>

        <div className="glass-card p-5">
          <h2 className="font-display font-semibold text-sm mb-3">By status</h2>
          {total === 0 ? (
            <p className="text-sm text-[color:var(--color-muted)]">No data yet.</p>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(statusCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => (
                  <div key={status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[color:var(--color-ink)]">
                        {STATUS_LABELS[status] || status}
                      </span>
                      <span className="text-[color:var(--color-muted)]">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${STATUS_COLORS[status] || "bg-gray-300"}`}
                        style={{ width: `${(count / maxStatusCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
