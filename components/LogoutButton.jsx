'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Defaults match the admin layout's usage; the rider layout passes
// its own redirectTo and className (dark header needs light text).
export default function LogoutButton({
  redirectTo = '/admin/login',
  className = 'text-sm text-[#6B6A61] hover:text-[#1E231C]',
}) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className={className}>
      Sign out
    </button>
  )
}
