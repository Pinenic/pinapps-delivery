// Builds an isolated auth store for one role. Admin and rider each get
// their own store instance from this — not a shared store with a
// `role` field — so a rider's session can never be read as an admin's
// or vice versa; they're just different objects in memory.
//
// A session only counts as "signed in as this role" once a row exists
// for that user in `table`. That's the same check the protected
// layouts already do server-side (supabase.auth.getUser() + a lookup
// in `admins`/`riders`, sign out and redirect if it's missing) — this
// mirrors it client-side so the store can't report someone as an admin
// just because they're an authenticated Supabase user. It doesn't
// replace the server check (a client store is never the real security
// boundary), it just means the client can't be wrong about which role
// it's holding.
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function createRoleStore({ role, table, fields = "*" }) {
  return create((set, get) => ({
    role,
    user: null,
    profile: null, // the admins/riders row — null until fetchProfile confirms it
    session: null,
    loading: true,
    error: null,
    initialized: false,

    setSession: (session, user, profile) => {
      set({
        session,
        user: user ?? session?.user ?? null,
        profile: profile !== undefined ? profile : get().profile,
        loading: false,
      });
    },

    clearSession: () =>
      set({ session: null, user: null, profile: null, loading: false }),

    /**
     * Confirms this user actually has a row in this role's table, and
     * loads it. If the row is missing — a valid Supabase session, but
     * the wrong role for this store — the store treats it as signed
     * out here rather than reporting a false positive. That's the
     * piece that keeps a rider token from ever showing up "signed in"
     * in the admin store, and back.
     */
    fetchProfile: async (user) => {
      if (!user) return;
      const { data, error } = await supabase
        .from(table)
        .select(fields)
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }
      if (!data) {
        get().clearSession();
        return;
      }
      set({ profile: data, loading: false, error: null });
    },

    /**
     * Client-side bootstrap + live auth-state subscription, same
     * shape as consumerStore.initialize(). Guarded by `initialized` —
     * safe to call on every provider mount.
     */
    initialize: async () => {
      if (get().initialized) return;
      set({ initialized: true, loading: true, error: null });

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (!session?.user) {
          set({ session: null, user: null, loading: false });
        } else {
          set({ session, user: session.user, loading: false });
          await get().fetchProfile(session.user);
        }

        supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_OUT" || !session) {
            get().clearSession();
            return;
          }
          set({ session, user: session.user });
          get().fetchProfile(session.user);
        });
      } catch (err) {
        set({
          error: err?.message || "Failed to initialize session",
          loading: false,
        });
      }
    },

    clearError: () => set({ error: null }),
  }));
}
