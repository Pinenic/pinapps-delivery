// app/rider/(protected)/profile/page.jsx
import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: rider, error } = await supabase
    .from('riders')
    .select('id, name, phone, vehicle_type, avatar_url, rating, status')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-md mx-auto">
      <h2 className="font-display text-lg font-semibold mb-4">Profile</h2>

      {error && (
        <p className="text-sm text-red-600 mb-4">
          Couldn&apos;t load your profile: {error.message}
        </p>
      )}

      {rider && <ProfileForm id={user.id} rider={rider} email={user.email} />}
    </div>
  )
}
