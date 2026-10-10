'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { normalizeZambianPhone, formatZambianPhone } from '@/lib/phone'

// Two-step phone auth, shared by login and signup. The only real
// difference between the two is what happens after the code is
// verified: signup also needs a name and creates the `consumers`
// row, login just goes straight through.
//
// mode: 'login' | 'signup'
export default function PhoneAuthForm({ mode }) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState('phone') // phone | code | name
  const [phoneInput, setPhoneInput] = useState('')
  const [phone, setPhone] = useState(null) // normalized E.164
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSendCode(e) {
    e.preventDefault()
    setError('')

    const normalized = normalizeZambianPhone(phoneInput)
    if (!normalized) {
      setError('Enter a Zambian mobile number, like 097 123 4567.')
      return
    }

    setLoading(true)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: normalized,
      // On login we don't want to silently create an account for a
      // number that was mistyped — the user thinks they already have
      // one. On signup, creating it is the whole point.
      options: { shouldCreateUser: mode === 'signup' },
    })
    setLoading(false)

    if (otpError) {
      setError(
        mode === 'login' && /not found|signups/i.test(otpError.message)
          ? "No account uses that number yet. Create one instead?"
          : otpError.message
      )
      return
    }

    setPhone(normalized)
    setStep('code')
  }

  async function handleVerify(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: 'sms',
    })

    if (verifyError) {
      setLoading(false)
      setError('That code didn\'t work. Check it and try again.')
      return
    }

    // Does a consumers row already exist for this user?
    const { data: existing } = await supabase
      .from('consumers')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle()

    setLoading(false)

    if (existing) {
      router.push('/book')
      router.refresh()
      return
    }

    // Verified but no profile yet — finish signup. This also catches
    // the case where someone started signup, verified, then dropped
    // off before entering a name: they land back here rather than
    // getting stuck with an auth user and no consumer row.
    setStep('name')
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
      phone,
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push('/book')
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      {step === 'phone' && (
        <form onSubmit={handleSendCode}>
          <h1 className="text-2xl font-semibold mb-1">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-[color:var(--consumer-muted)] mb-6">
            We&apos;ll text you a code to confirm your number.
          </p>

          <label className="block text-sm font-medium mb-1.5" htmlFor="phone">
            Mobile number
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="097 123 4567"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            className="consumer-input mb-4"
          />

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          <button type="submit" disabled={loading} className="consumer-btn">
            {loading ? 'Sending code…' : 'Send code'}
          </button>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={handleVerify}>
          <button
            type="button"
            onClick={() => {
              setStep('phone')
              setCode('')
              setError('')
            }}
            className="flex items-center gap-1.5 text-sm text-[color:var(--consumer-muted)] mb-4"
          >
            <ArrowLeft size={14} /> Change number
          </button>

          <h1 className="text-2xl font-semibold mb-1">Enter your code</h1>
          <p className="text-sm text-[color:var(--consumer-muted)] mb-6">
            Sent to {formatZambianPhone(phone)}
          </p>

          <label className="block text-sm font-medium mb-1.5" htmlFor="code">
            6-digit code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="consumer-input mb-4 tracking-[0.3em] text-center text-lg"
          />

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="consumer-btn"
          >
            {loading ? 'Checking…' : 'Confirm'}
          </button>
        </form>
      )}

      {step === 'name' && (
        <form onSubmit={handleCreateProfile}>
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
            {loading ? 'Finishing…' : 'Finish'}
          </button>
        </form>
      )}
    </div>
  )
}
