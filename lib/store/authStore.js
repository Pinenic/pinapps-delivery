// lib/store/authStore.js
// Client-side mirror of the session — NOT the source of truth.
// The source of truth is always the server-side supabase.auth.getUser()
// call in the protected layouts. This store just holds what that check
// already found, so client components (buttons, forms) don't each need
// to call supabase.auth.getUser() themselves and make their own
// round-trip to Supabase before every action.
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null, // Supabase auth user object, or null
  role: null, // 'admin' | 'rider' | null
  initialized: false,

  setSession: (user, role) => set({ user, role, initialized: true }),
  clearSession: () => set({ user: null, role: null, initialized: true }),
}))
