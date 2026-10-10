"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { claimJob } from "@/lib/services/riderService";

// onClaimed: optional — pass a refetch from a client view. Without it
// (e.g. rendered inside a list that doesn't refetch), falls back to
// router.refresh(); the realtime subscription on the page covers the rest.
export default function ClaimJobButton({ orderId, onClaimed }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const refresh = () => (onClaimed ? onClaimed() : router.refresh());

  async function handleClaim() {
    setSubmitting(true);
    setError("");

    // The race guard lives server-side (riderDb.claimJob): the update
    // only matches if the job is STILL pending and unassigned, so a
    // second rider gets a 409 instead of overwriting the first claim.
    try {
      const result = await claimJob(orderId);
      if (result?.warning) setError(result.warning);
      refresh();
    } catch (err) {
      setError(err.message);
      if (err.status === 409) refresh(); // drop it from this rider's open-pool view
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClaim}
        disabled={submitting}
        className="w-full bg-[#1E231C] text-white text-sm px-4 py-2.5 rounded-md hover:bg-[#D4A017] hover:text-[#1E231C] transition-colors disabled:opacity-50"
      >
        {submitting ? "Claiming..." : "Claim this job"}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
