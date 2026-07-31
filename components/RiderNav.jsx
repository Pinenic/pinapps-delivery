// components/RiderNav.jsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, CheckCircle2, User } from 'lucide-react'

const TABS = [
  { href: '/rider', label: 'Home', icon: Home, exact: true },
  { href: '/rider/jobs', label: 'Jobs', icon: Package },
  { href: '/rider/completed', label: 'Completed', icon: CheckCircle2 },
  { href: '/rider/profile', label: 'Profile', icon: User },
]

export default function RiderNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 px-3 pb-3">
      <div className="glass-card-solid flex items-center justify-around px-2 py-2">
        {TABS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
                active
                  ? 'text-[color:var(--color-primary-dark)]'
                  : 'text-[color:var(--color-muted)]'
              }`}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.25 : 1.75}
                fill={active ? 'var(--color-primary-pale)' : 'none'}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
