import Link from "next/link";
import { getCurrentAdmin } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { AdminNav } from "@/components/admin-nav";
import { ShieldIcon } from "@/components/ui/icons";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();

  return (
    <div className="min-h-screen bg-slate-50">
      {admin && (
        <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-soft">
                  <ShieldIcon size={18} />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-slate-900">Admin Panel</span>
                  <span className="text-[11px] text-slate-500">Manajemen Cuti</span>
                </div>
              </Link>
              <AdminNav />
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {initials(admin.name)}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium text-slate-900">{admin.name}</span>
                  <span className="text-[11px] text-slate-500">@{admin.username}</span>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </header>
      )}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
