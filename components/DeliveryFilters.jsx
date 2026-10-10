"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { STATUS_LABELS } from "@/components/ui/StatusBadge";

const STATUS_OPTIONS = [
  "all",
  "pending",
  "assigned",
  "picked_up",
  "in_transit",
  "delivered",
  "failed",
  "cancelled",
];

const inputClass =
  "px-3 py-1.5 rounded-xl text-sm bg-white/70 border border-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/30 focus:border-[color:var(--color-primary)]";

export default function DeliveryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") || "all";
  const source = searchParams.get("source") || "all";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const hasFilters =
    status !== "all" || source !== "all" || dateFrom || dateTo;

  function update(key, value) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Any filter change invalidates the current page position.
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <select
        value={status}
        onChange={(e) => update("status", e.target.value === "all" ? "" : e.target.value)}
        className={inputClass}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s === "all" ? "All statuses" : STATUS_LABELS[s] || s}
          </option>
        ))}
      </select>

      <select
        value={source}
        onChange={(e) =>
          update("source", e.target.value === "all" ? "" : e.target.value)
        }
        className={inputClass}
      >
        <option value="all">All sources</option>
        <option value="consumer">Consumer</option>
        <option value="api">Business clients</option>
      </select>

      <input
        type="date"
        value={dateFrom}
        onChange={(e) => update("dateFrom", e.target.value)}
        className={inputClass}
        aria-label="From date"
      />
      <span className="text-[color:var(--color-muted)] text-sm">–</span>
      <input
        type="date"
        value={dateTo}
        onChange={(e) => update("dateTo", e.target.value)}
        className={inputClass}
        aria-label="To date"
      />

      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="text-xs text-[color:var(--color-muted)] underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}