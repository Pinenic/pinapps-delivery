'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Email + password auth for consumers. Phone was the original plan,
// but it's parked until an SMS provider is set up — phone is now
// collected as a contact detail on the profile page instead.
//
// mode: 'login' | 'signup'
export default function EmailAuthForm({ mode }) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState('form') // form | confirm | name
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Creates the consumers row if it doesn't exist yet, then moves on.
  // Called after both signup (when email confirmation is off) and
  // login (covering anyone who confirmed by email and is arriving
  // for the first time with no profile row yet).
  async function ensureProfileThenContinue(user, fallbackName) {
    const { data: existing } = await supabase
      .from('consumers')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (existing) {
      router.push('/book')
      router.refresh()
      return
    }

    const resolvedName =
      fallbackName?.trim() || user.user_metadata?.name?.trim() || ''

    if (!resolvedName) {
      // No name anywhere — ask for it rather than inventing one.
      setStep('name')
      return
    }

    const { error: insertError } = await supabase.from('consumers').insert({
      id: user.id,
      name: resolvedName,
      email: user.email,
    })

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push('/book')
    router.refresh()
  }

  async function handleSignup(e) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Use at least 8 characters for your password.')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      // Stashed here so it survives an email-confirmation round trip —
      // otherwise the name is lost between signing up and coming back
      // via the confirmation link.
      options: { data: { name: name.trim() } },
    })

    if (signUpError) {
      setLoading(false)
      setError(signUpError.message)
      return
    }

    // No session means Supabase is set to require email confirmation.
    if (!data.session) {
      setLoading(false)
      setStep('confirm')
      return
    }

    await ensureProfileThenContinue(data.user, name)
    setLoading(false)
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      setLoading(false)
      setError(
        /invalid login credentials/i.test(signInError.message)
          ? 'That email and password don\u2019t match an account.'
          : signInError.message
      )
      return
    }

    await ensureProfileThenContinue(data.user)
    setLoading(false)
  }

  async function handleCreateProfile(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error: insertError } = await supabase.from('consumers').insert({
      id: user.id,
      name: name.trim(),
      email: user.email,
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push('/book')
    router.refresh()
  }

  if (step === 'confirm') {
    return (
      <div className="w-full max-w-sm text-center">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'rgba(99,102,241,0.1)' }}
        >
          <MailCheck size={20} style={{ color: 'var(--consumer-accent)' }} />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Check your email</h1>
        <p className="text-sm text-[color:var(--consumer-muted)]">
          We sent a confirmation link to{' '}
          <span className="font-medium text-[color:var(--consumer-ink)]">
            {email}
          </span>
          . Open it to finish setting up your account.
        </p>
      </div>
    )
  }

  if (step === 'name') {
    return (
      <form onSubmit={handleCreateProfile} className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-1">One last thing</h1>
        <p className="text-sm text-[color:var(--consumer-muted)] mb-6">
          Riders will see this name when they pick up or drop off.
        </p>

        <label className="block text-sm font-medium mb-1.5" htmlFor="name">
          Your name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="consumer-input mb-4"
        />

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="consumer-btn"
        >
          {loading ? 'Finishing\u2026' : 'Finish'}
        </button>
      </form>
    )
  }

  const isSignup = mode === 'signup'

  return (
    <form
      onSubmit={isSignup ? handleSignup : handleLogin}
      className="w-full max-w-sm"
    >
      <h1 className="text-2xl font-semibold mb-1">
        {isSignup ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="text-sm text-[color:var(--consumer-muted)] mb-6">
        {isSignup
          ? 'You can add a contact number once you\u2019re in.'
          : 'Sign in to send and track packages.'}
      </p>

      {isSignup && (
        <>
          <label className="block text-sm font-medium mb-1.5" htmlFor="name">
            Your name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="consumer-input mb-4"
          />
        </>
      )}

      <label className="block text-sm font-medium mb-1.5" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="consumer-input mb-4"
      />

      <label className="block text-sm font-medium mb-1.5" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        type="password"
        autoComplete={isSignup ? 'new-password' : 'current-password'}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="consumer-input mb-1"
      />
      {isSignup && (
        <p className="text-xs text-[color:var(--consumer-muted)] mb-4">
          At least 8 characters.
        </p>
      )}
      {!isSignup && <div className="mb-4" />}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <button type="submit" disabled={loading} className="consumer-btn">
        {loading
          ? isSignup
            ? 'Creating account\u2026'
            : 'Signing in\u2026'
          : isSignup
            ? 'Create account'
            : 'Sign in'}
      </button>
    </form>
  )
}
