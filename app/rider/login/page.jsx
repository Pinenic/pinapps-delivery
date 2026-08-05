'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RiderLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    router.push('/rider')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F2] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-8 rounded-lg shadow-sm border border-[#E5E1D8]"
      >
        <h1 className="text-xl font-semibold mb-1 text-[#262620]">
          Rider login
        </h1>
        <p className="text-sm text-[#6B6A61] mb-6">
          Corn Mart Delivery
        </p>

        <label className="block text-sm font-medium mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 border border-[#E5E1D8] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 focus:border-[#D4A017]"
        />

        <label className="block text-sm font-medium mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 border border-[#E5E1D8] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 focus:border-[#D4A017]"
        />

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1E231C] text-white py-2.5 rounded-md text-sm font-medium hover:bg-[#D4A017] hover:text-[#1E231C] transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
