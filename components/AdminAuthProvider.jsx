"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAdminStore } from "@/lib/store/adminStore";

// No initialUser/initialRole props — the store bootstraps itself via
// getSession() + an `admins` row lookup (see createRoleStore). The
// server layout's own supabase.auth.getUser() + admins check is still
// what actually gates the page and redirects; this just gives client
// components (forms, buttons that call the API) a token to send.
export default function AdminAuthProvider({ children }) {
  const router = useRouter();
  const initialize = useAdminStore((s) => s.initialize);
  const clearSession = useAdminStore((s) => s.clearSession);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Separate, lightweight subscription purely for the router-side
  // effect on sign-out.
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
