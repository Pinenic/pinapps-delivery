'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Truck, Building2 } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Deliveries', icon: LayoutDashboard },
  { href: '/admin/riders', label: 'Riders', icon: Truck },
  { href: '/admin/clients', label: 'Clients', icon: Building2 },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-background text-foreground flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-white/10">
        <p className="text-primary font-semibold text-sm tracking-wide">
          CORN MART
        </p>
        <p className="text-xs text-accent">Delivery Admin</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? 'bg-accent/15 text-foreground'
                  : 'hover:bg-accent-hover hover:text-foreground'
              }`}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
