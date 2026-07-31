// components/AuthProvider.jsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/authStore'

// Hydrates the Zustand store from the user/role the server layout
// already verified (no extra fetch), then subscribes to
// onAuthStateChange for anything that happens after — token refresh,
// or signing out in another tab. onAuthStateChange is driven by the
// Supabase client's local session storage, not a fresh network call,
// so this doesn't reintroduce the problem the proxy fix addressed.
export default function AuthProvider({ initialUser, initialRole, children }) {
  const router = useRouter()
  const setSession = useAuthStore((s) => s.setSession)
  const clearSession = useAuthStore((s) => s.clearSession)

  useEffect(() => {
    setSession(initialUser, initialRole)
  }, [initialUser, initialRole, setSession])

  useEffect(() => {
    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        clearSession()
        router.refresh()
        return
      }
      if (session?.user) {
        setSession(session.user, initialRole)
      }
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return children
}
