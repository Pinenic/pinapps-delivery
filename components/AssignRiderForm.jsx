"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignRider } from "@/lib/services/adminService";

export default function AssignRiderForm({ orderId, riders, currentRiderId }) {
  const router = useRouter();

  const [riderId, setRiderId] = useState(currentRiderId || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleAssign(e) {
    e.preventDefault();
    if (!riderId) return;

    setSubmitting(true);
    setError("");

    try {
      // One server call validates the order, assigns the rider, writes the
      // audit log (with the real admin id) and refreshes rider availability.
      const result = await assignRider(orderId, riderId);
      if (result?.warning) setError(result.warning);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleAssign} className="flex items-center gap-3">
      <select
        value={riderId}
        onChange={(e) => setRiderId(e.target.value)}
        className="px-3 py-2 border border-[#E5E1D8] rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 focus:border-[#D4A017]"
      >
        <option value="">Select a rider…</option>
        {riders.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name} — {r.status}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={submitting || !riderId}
        className="bg-[#1E231C] text-white text-sm px-4 py-2 rounded-md hover:bg-[#D4A017] hover:text-[#1E231C] transition-colors disabled:opacity-50"
      >
        {submitting
          ? "Assigning..."
          : currentRiderId
          ? "Reassign rider"
          : "Assign rider"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
