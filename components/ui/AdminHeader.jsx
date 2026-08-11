// components/AdminHeader.jsx
"use client";

import Link from "next/link";
import {
  Search,
  Bell,
  User,
  Menu,
  X,
  LayoutDashboard,
  Truck,
  Building2,
  Package,
  MapPin,
  BarChart3,
} from "lucide-react";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/deliveries", label: "Deliveries", icon: Package },
  { href: "/admin/riders", label: "Riders", icon: Truck },
  { href: "/admin/clients", label: "Clients", icon: Building2 },
  // { href: "/admin/tracking", label: "Tracking", icon: MapPin },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminHeader({ adminName }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/50 backdrop-blur-md p-1 px-4">
      <div className=" flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-8">
          <span className="sm:hidden font-display font-semibold text-[15px] tracking-tight">
            P-<span className="text-[color:var(--color-primary)]">Delivery</span>
          </span>
          <span className="hidden sm:inline font-display font-semibold text-[15px] tracking-tight">
            Pinapps{" "}
            <span className="text-[color:var(--color-primary)]">Delivery</span>
          </span>
          <nav className="hidden md:flex gap-1 lg:gap-2 overflow-x-auto">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-colors ${
                    active
                      ? "bg-[color:var(--color-primary-pale)] text-[color:var(--color-primary-dark)] font-medium"
                      : "text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
                  }`}
                >
                  <Icon size={14} strokeWidth={2} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {/* <Bell size={16} className="text-muted-foreground" /> */}

          <div className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              aria-label="Account menu"
              className="flex items-center"
            >
              <User size={18} />
            </button>
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-44 rounded-xl bg-white shadow-lg border border-black/5 py-1">
                  {adminName && (
                    <p className="px-3 py-2 text-xs text-muted-foreground border-b border-black/5">
                      Signed in as{" "}
                      <span className="font-medium">{adminName}</span>
                    </p>
                  )}
                  <div className="px-3 py-2">
                    <LogoutButton className="text-sm text-muted-foreground hover:text-foreground" />
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-1"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {/* Mobile / tablet nav panel */}
      {menuOpen && (
        <nav className="md:hidden border-t border-black/5 bg-white/95 backdrop-blur-md px-2 py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  active
                    ? "bg-accent/15 text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <Icon size={16} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
