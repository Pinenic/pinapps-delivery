// app/rider/(protected)/layout.jsx
// Mobile-first. Top bar keeps just the brand mark + a quick sign-out;
// account details live on the Profile tab now. Bottom tab nav is the
// primary way to move between the five rider-facing pages.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import RiderNav from "@/components/RiderNav";
import AuthProvider from "@/components/AuthProvider";

function ConnectionError() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm text-center glass-card-solid p-6">
        <p className="text-sm font-medium mb-1">Can&apos;t reach the server</p>
        <p className="text-sm text-[color:var(--color-muted)]">
          There was a problem connecting to Supabase. Check your connection and
          try again.
        </p>
      </div>
    </div>
  );
}

export default async function RiderLayout({ children }) {
  const supabase = await createClient();

  let user;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    return <ConnectionError />;
  }

  if (!user) {
    redirect("/rider/login");
  }

  const { data: rider } = await supabase
    .from("riders")
    .select("id, name")
    .eq("id", user.id)
    .maybeSingle();

  if (!rider) {
    await supabase.auth.signOut();
    redirect("/rider/login");
  }

  return (
    <AuthProvider initialUser={user} initialRole="rider">
      <div className="min-h-screen">
        <header className="sticky top-0 z-10 px-3 pt-3">
          <div className="glass-card-solid flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-mono-tracking text-[10px] text-[color:var(--color-primary)] uppercase tracking-wider">
                Corn Mart Delivery
              </p>
              <p className="text-sm font-semibold leading-tight">
                {rider.name}
              </p>
            </div>
            <LogoutButton
              redirectTo="/rider/login"
              className="text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
            />
          </div>
        </header>
        <main className="p-3 pb-24">{children}</main>
        <RiderNav />
      </div>
    </AuthProvider>
  );
}
