// components/AdminHeader.jsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/riders', label: 'Riders' },
  { href: '/admin/clients', label: 'Clients' },
]

export default function AdminHeader({ adminName }) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 bg-white/50 backdrop-blur-md p-1 px-4">
      <div className=" flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-8">
          <span className="font-display font-semibold text-[15px] tracking-tight">
            Pinapps{' '}
            <span className="text-[color:var(--color-primary)]">Delivery</span>
          </span>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    active
                      ? 'bg-[color:var(--color-primary-pale)] text-[color:var(--color-primary-dark)] font-medium'
                      : 'text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[color:var(--color-muted)]">
            {adminName}
          </span>
          <LogoutButton className="text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]" />
        </div>
      </div>
    </header>
  )
}
