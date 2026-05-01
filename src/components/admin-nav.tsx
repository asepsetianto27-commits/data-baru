"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChartIcon, InboxIcon, UserIcon } from "@/components/ui/icons";

interface NavItemDef {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const ITEMS: NavItemDef[] = [
  { href: "/admin", label: "Pengajuan", icon: <InboxIcon size={16} /> },
  { href: "/admin/rekap", label: "Rekap", icon: <ChartIcon size={16} /> },
  { href: "/admin/akun", label: "Akun", icon: <UserIcon size={16} /> },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin" || /^\/admin\/[^/]+$/.test(pathname);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname() ?? "/admin";
  return (
    <nav className="flex flex-wrap items-center gap-1">
      {ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <span className={cn(active ? "text-brand-600" : "text-slate-400")}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
