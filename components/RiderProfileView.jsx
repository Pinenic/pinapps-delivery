'use client'

import { useAuthStore } from '@/lib/store/authStore'
import { useApiData } from '@/lib/hooks/useApiData'
import { getRiderProfile } from '@/lib/services/riderService'
import ProfileForm from '@/components/ProfileForm'

export default function RiderProfileView() {
  const user = useAuthStore((s) => s.user)
  const ready = useAuthStore((s) => !!s.session)
  const { data: rider, error, loading, refetch } = useApiData(getRiderProfile, {
    enabled: ready,
  })

  if (loading) {
    return <p className="text-sm text-[color:var(--color-muted)]">Loading…</p>
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="font-display text-lg font-semibold mb-4">Profile</h2>

      {error && (
        <p className="text-sm text-red-600 mb-4">
          Couldn&apos;t load your profile: {error.message}
        </p>
      )}

      {rider && <ProfileForm id={user.id} rider={rider} email={user.email} onSaved={refetch} />}
    </div>
  )
}
