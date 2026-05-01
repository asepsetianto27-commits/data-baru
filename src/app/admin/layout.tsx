import Link from "next/link";
import { getCurrentAdmin } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();

  return (
    <div className="min-h-screen bg-slate-50">
      {admin && (
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="text-base font-semibold">
                Admin Panel · Cuti
              </Link>
              <nav className="hidden gap-4 text-sm sm:flex">
                <Link href="/admin" className="text-slate-600 hover:text-slate-900">
                  Pengajuan
                </Link>
                <Link href="/admin/rekap" className="text-slate-600 hover:text-slate-900">
                  Rekap Bulanan
                </Link>
                <Link href="/admin/akun" className="text-slate-600 hover:text-slate-900">
                  Akun
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden text-slate-500 sm:inline">
                {admin.name} (@{admin.username})
              </span>
              <LogoutButton />
            </div>
          </div>
        </header>
      )}
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
