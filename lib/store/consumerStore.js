// Consumer-facing counterpart to useAuthStore: same shape (session,
// user, loading, error, an onAuthStateChange subscription), but
// keyed to the "consumers" table instead of "profiles". Always
// bootstraps itself client-side via getSession() — no server-passed
// initialSession/initialUser/initialConsumer required.
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const useConsumerStore = create((set, get) => ({
  user: null,
  consumer: null,
  session: null,
  loading: true,
  error: null,
  initialized: false,

  /**
   * Sets session/user/consumer directly — no network call. Used by
   * the auth-state listener below to apply an updated session.
   */
  setSession: (session, user, consumer) => {
    set({
      session,
      user: user ?? session?.user ?? null,
      // Keep the existing consumer in the store unless a new one was
      // explicitly passed in (e.g. don't clobber it on a token refresh).
      consumer: consumer !== undefined ? consumer : get().consumer,
      loading: false,
    });
  },

  clearSession: () =>
    set({ session: null, user: null, consumer: null, loading: false }),

  /**
   * Fetches the consumer row for the given auth user and stores it.
   */
  fetchConsumerProfile: async (user) => {
    if (!user) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("consumers")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        set({ error: error.message, loading: false });
        return { error: error.message };
      }
      set({ consumer: data, loading: false, error: null });
    } catch (err) {
      const errorMessage =
        err?.message || "An unexpected error occurred during profile fetch.";
      set({ error: errorMessage, loading: false });
      return { error: errorMessage };
    }
  },

  /**
   * Initializes session on startup & listens to real-time auth
   * changes — mirrors useAuthStore.initialize() exactly, just against
   * the "consumers" table. Safe to call on every
   * ConsumerAuthProvider mount: the `initialized` guard means
   * getSession()/subscription setup only ever runs once.
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

      set({ session, user: session?.user ?? null, loading: false });

      if (session?.user) {
        await get().fetchConsumerProfile(session.user);
      }

      supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          get().clearSession();
          return;
        }
        set({ session, user: session.user });
        get().fetchConsumerProfile(session.user);
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