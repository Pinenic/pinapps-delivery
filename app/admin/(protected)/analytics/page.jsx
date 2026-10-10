import DashboardChart from "@/components/DashboardChart";
import { STATUS_LABELS } from "@/components/ui/StatusBadge";
import { requireAdminPage } from "@/lib/auth/requireAdminPage";
import { getAdminStats, statsDayToDate } from "@/lib/db/statsDb";

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
  return (
    <div className="glass-card p-5">
      <p className="text-sm text-[color:var(--color-muted)] mb-1">{label}</p>
      <p className="font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default async function AnalyticsPage() {
  await requireAdminPage();

  let stats = null;
  let error = null;
  try {
    stats = await getAdminStats(30);
  } catch (err) {
    error = err.message;
  }

  const total = stats?.total ?? 0;
  const delivered = stats?.delivered ?? 0;
  const completionRate = total > 0 ? Math.round((delivered / total) * 100) : 0;
  const avgFee = stats?.avg_fee != null ? Number(stats.avg_fee).toFixed(2) : null;
  const riderCount = stats?.rider_count ?? 0;

  const statusCounts = stats?.by_status ?? {};
  const maxStatusCount = Math.max(1, ...Object.values(statusCounts));

  const chartData = (stats?.daily ?? []).map((d) => ({
    label: statsDayToDate(d.day).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }),
    count: d.count,
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
          Couldn&apos;t load analytics: {error}
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