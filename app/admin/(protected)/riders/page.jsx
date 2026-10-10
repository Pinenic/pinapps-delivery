// app/admin/(protected)/riders/page.jsx
import StatusBadge from "@/components/ui/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Riders",
};

const STATUS_STYLES = {
  available: "bg-green-100 text-green-700",
  busy: "bg-yellow-100 text-yellow-700",
  offline: "bg-gray-100 text-gray-700",
};

export default async function RidersPage() {
  const supabase = await createClient();

  const { data: riders, error } = await supabase
    .from("riders")
    .select("id, name, phone, vehicle_type, status, rating")
    .order("name");

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#262620]">Riders</h2>
          <p className="text-sm text-[#6B6A61]">
            All riders registered on the platform.
          </p>
        </div>
        <Link
          href="/admin/riders/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[color:var(--color-primary)] text-white text-sm font-medium hover:bg-[color:var(--color-primary-dark)] transition-colors"
        >
          <Plus size={16} /> Create rider
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4">
          Couldn&apos;t load riders: {error.message}
        </p>
      )}

      <div className="hidden md:block bg-white border border-[#E5E1D8] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF8F2] text-left text-[#6B6A61]">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Phone</th>
              <th className="px-4 py-2 font-medium">Vehicle</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Rating</th>
            </tr>
          </thead>
          <tbody>
            {riders?.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-[#A8A79C]"
                >
                  No riders yet — run seed.js to add test riders.
                </td>
              </tr>
            )}
            {riders?.map((rider) => (
              <tr key={rider.id} className="border-t border-[#EFECE4]">
                <td className="px-4 py-2">{rider.name}</td>
                <td className="px-4 py-2">{rider.phone}</td>
                <td className="px-4 py-2 capitalize">
                  {rider.vehicle_type || "—"}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_STYLES[rider.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {rider.status}
                  </span>
                </td>
                <td className="px-4 py-2">{rider.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {riders?.length > 0 && (
        <div className="md:hidden space-y-3">
          {riders.map((rider) => (
            <Link
              key={rider.id}
              href={`/admin/deliveries/${rider.id}`}
              className="block glass-card-solid p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono-tracking text-xs text-[color:var(--color-primary-dark)]">
                  #{rider.id.slice(0, 8)}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    STATUS_STYLES[rider.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {rider.status}
                </span>
              </div>
              <p className="text-sm font-medium">{rider.dropoff_name}</p>
              <div className="flex items-center justify-between mt-2 text-xs text-[color:var(--color-muted)]">
                <span>{rider?.name || "Unassigned"}</span>
                <span>{rider.rating ? `${rider.rating}★` : "—"}</span>
              </div>
              <p className="text-[11px] text-[color:var(--color-muted)] mt-1">
                {rider.phone}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
