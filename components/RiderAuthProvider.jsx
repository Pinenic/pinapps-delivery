"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRiderStore } from "@/lib/store/riderStore";

// No initialUser/initialRole props — the store bootstraps itself via
// getSession() + a `riders` row lookup (see createRoleStore). The
// server layout's own check still gates the page and redirects; this
// just gives client components (ClaimJobButton, riderService, ...) a
// token to send.
export default function RiderAuthProvider({ children }) {
  const router = useRouter();
  const initialize = useRiderStore((s) => s.initialize);
  const clearSession = useRiderStore((s) => s.clearSession);

  useEffect(() => {
    initialize();
  }, [initialize]);

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
