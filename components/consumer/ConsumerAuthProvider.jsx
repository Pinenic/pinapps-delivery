"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useConsumerStore } from "@/lib/store/consumerStore";

export default function ConsumerAuthProvider({ children }) {
  const router = useRouter();
  const initialize = useConsumerStore((s) => s.initialize);
  const clearSession = useConsumerStore((s) => s.clearSession);

  // Bootstraps the store client-side: fetches the current session via
  // getSession(), loads the consumer profile if one exists, and wires
  // up the store's own auth-state subscription. Guarded internally by
  // `initialized`, so this is a no-op on re-renders/remounts.
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Separate, lightweight subscription purely for the router-side
  // effect on sign-out — state syncing itself is the store's job.
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        clearSession();
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
}