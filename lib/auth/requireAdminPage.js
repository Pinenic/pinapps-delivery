// For admin server-component PAGES that read through the service role
// (e.g. the stats RPC). The layout already checks admin access, but layouts
// don't re-run on every navigation, so a page that bypasses RLS re-checks
// for itself. Redirects to the login page if the visitor isn't an admin.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/db/adminDb";

export async function requireAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  try {
    await requireAdmin(user.id);
  } catch (err) {
    if (err?.status === 403) redirect("/admin/login");
    throw err;
  }
  return user;
}
