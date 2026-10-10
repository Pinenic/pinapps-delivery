'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { PackagePlus, Clock, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const TABS = [
  { href: '/book', label: 'Send', icon: PackagePlus },
  { href: '/orders', label: 'Orders', icon: Clock },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function ConsumerNav({ consumerName }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop / tablet: top bar */}
      <header className="hidden md:flex items-center justify-between px-5 py-3 border-b border-[color:var(--consumer-line)] bg-white">
        <Link href="/" className="font-semibold">
          Pinapps
        </Link>
        <nav className="flex items-center gap-1">
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-[color:var(--consumer-accent)]/10 text-[color:var(--consumer-accent-dark)] font-medium'
                    : 'text-[color:var(--consumer-muted)] hover:text-[color:var(--consumer-ink)]'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[color:var(--consumer-muted)]">
            {consumerName}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-[color:var(--consumer-muted)] hover:text-[color:var(--consumer-ink)]"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Mobile: bottom tabs. Same pattern as the rider app — this is
          a phone-first product for both audiences. */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[color:var(--consumer-line)] flex">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 ${
                active
                  ? 'text-[color:var(--consumer-accent)]'
                  : 'text-[color:var(--consumer-muted)]'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
