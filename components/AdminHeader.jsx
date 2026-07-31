"use client";

import { Search } from "lucide-react";
import { Bell } from "lucide-react";
import { User } from "lucide-react";
import { LayoutDashboard, Truck, Building2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/stage/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/stage/admin/riders", label: "Riders", icon: Truck },
  { href: "/stage/admin/clients", label: "Clients", icon: Building2 },
  { href: "/stage/admin/deliveries", label: "Deliveries", icon: LayoutDashboard },
  { href: "/stage/admin/tracking", label: "Tracking", icon: Truck },
  { href: "/stage/admin/analytics", label: "Analytics", icon: Building2 },
];

export default function AdminHeader() {
  const pathname = usePathname();

  return (
    <div className="flex justify-between items-center bg-white/50 backdrop-blur-md p-1 px-4">
      <div className="p-2 text-xl">Pinapps Logistics</div>

      <div className="flex gap-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                active
                  ? "bg-accent/15 text-foreground"
                  : "hover:bg-accent/5 hover:text-muted-foreground"
              }`}
            >
              {active ? <Icon size={14} strokeWidth={2} /> : <></>}
              {label}
            </Link>
          );
        })}
      </div>

      <div className="flex justify-between items-center gap-8 p-2 rounded-3xl">
        <Search size={16}/>
        <Bell size={16} />
        <User size={18} />
      </div>
    </div>
  );
}
