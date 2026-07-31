// components/ProfileForm.jsx
'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User2, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full px-3 py-2 rounded-xl text-sm bg-white/70 border border-[color:var(--color-border)] ' +
  'focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/30 focus:border-[color:var(--color-primary)]'

function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <span className="block text-xs font-medium mb-1">{label}</span>
      {children}
    </label>
  )
}

export default function ProfileForm({ rider, email }) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef(null)

  const [avatarUrl, setAvatarUrl] = useState(rider.avatar_url)
  const [name, setName] = useState(rider.name || '')
  const [phone, setPhone] = useState(rider.phone || '')
  const [vehicleType, setVehicleType] = useState(rider.vehicle_type || '')

  const [newEmail, setNewEmail] = useState(email || '')
  const [newPassword, setNewPassword] = useState('')

  const [contactStatus, setContactStatus] = useState(null) // { type, message }
  const [credentialsStatus, setCredentialsStatus] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [savingContact, setSavingContact] = useState(false)
  const [savingCredentials, setSavingCredentials] = useState(false)

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)

    const filePath = `${rider.id}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setAvatarUploading(false)
      setContactStatus({ type: 'error', message: uploadError.message })
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from('riders')
      .update({ avatar_url: publicUrl })
      .eq('id', rider.id)

    setAvatarUploading(false)

    if (updateError) {
      setContactStatus({ type: 'error', message: updateError.message })
      return
    }

    setAvatarUrl(publicUrl)
    router.refresh()
  }

  async function handleContactSubmit(e) {
    e.preventDefault()
    setSavingContact(true)
    setContactStatus(null)

    const { error } = await supabase
      .from('riders')
      .update({ name, phone, vehicle_type: vehicleType })
      .eq('id', rider.id)

    setSavingContact(false)

    if (error) {
      setContactStatus({ type: 'error', message: error.message })
      return
    }

    setContactStatus({ type: 'success', message: 'Contact info updated.' })
    router.refresh()
  }

  async function handleCredentialsSubmit(e) {
    e.preventDefault()
    setSavingCredentials(true)
    setCredentialsStatus(null)

    const updates = {}
    if (newEmail && newEmail !== email) updates.email = newEmail
    if (newPassword) updates.password = newPassword

    if (Object.keys(updates).length === 0) {
      setSavingCredentials(false)
      setCredentialsStatus({ type: 'error', message: 'Nothing to update.' })
      return
    }

    const { error } = await supabase.auth.updateUser(updates)

    setSavingCredentials(false)
    setNewPassword('')

    if (error) {
      setCredentialsStatus({ type: 'error', message: error.message })
      return
    }

    setCredentialsStatus({
      type: 'success',
      message: updates.email
        ? 'Check your new email inbox to confirm the change.'
        : 'Password updated.',
    })
  }

  return (
    <div className="space-y-4">
      <div className="glass-card-solid p-5 flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative h-16 w-16 rounded-full bg-[color:var(--color-primary-pale)] flex items-center justify-center overflow-hidden shrink-0"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Your avatar" className="h-full w-full object-cover" />
          ) : (
            <User2 size={24} className="text-[color:var(--color-primary-dark)]" />
          )}
          <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-[color:var(--color-primary)] flex items-center justify-center">
            <Camera size={11} className="text-white" />
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
        <div>
          <p className="text-sm font-medium">{rider.name}</p>
          <p className="text-xs text-[color:var(--color-muted)]">
            {avatarUploading ? 'Uploading...' : 'Tap the icon to change photo'}
          </p>
        </div>
      </div>

      <form onSubmit={handleContactSubmit} className="glass-card-solid p-5">
        <h3 className="text-sm font-semibold mb-3">Contact info</h3>
        <Field label="Full name">
          <input required className={inputClass} value={name}
            onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Phone">
          <input required type="tel" placeholder="+2609XXXXXXXX" className={inputClass}
            value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="Vehicle type">
          <input className={inputClass} value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)} />
        </Field>

        {contactStatus && (
          <p className={`text-sm mt-1 mb-2 ${contactStatus.type === 'error' ? 'text-red-600' : 'text-[color:var(--color-success)]'}`}>
            {contactStatus.message}
          </p>
        )}

        <button
          type="submit"
          disabled={savingContact}
          className="w-full bg-[color:var(--color-primary)] text-white text-sm px-4 py-2.5 rounded-full hover:bg-[color:var(--color-primary-dark)] transition-colors disabled:opacity-50 mt-2"
        >
          {savingContact ? 'Saving...' : 'Save contact info'}
        </button>
      </form>

      <form onSubmit={handleCredentialsSubmit} className="glass-card-solid p-5">
        <h3 className="text-sm font-semibold mb-3">Login credentials</h3>
        <Field label="Email">
          <input type="email" className={inputClass} value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)} />
        </Field>
        <Field label="New password">
          <input type="password" placeholder="Leave blank to keep current" className={inputClass}
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </Field>

        {credentialsStatus && (
          <p className={`text-sm mt-1 mb-2 ${credentialsStatus.type === 'error' ? 'text-red-600' : 'text-[color:var(--color-success)]'}`}>
            {credentialsStatus.message}
          </p>
        )}

        <button
          type="submit"
          disabled={savingCredentials}
          className="w-full border border-[color:var(--color-primary)] text-[color:var(--color-primary-dark)] text-sm px-4 py-2.5 rounded-full hover:bg-[color:var(--color-primary-pale)] transition-colors disabled:opacity-50 mt-2"
        >
          {savingCredentials ? 'Updating...' : 'Update credentials'}
        </button>
      </form>
    </div>
  )
}
