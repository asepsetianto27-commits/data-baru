import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircleIcon,
  ShieldIcon,
  SparkleIcon,
} from "@/components/ui/icons";

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(at 20% 0%, rgb(199 210 254 / 0.6) 0px, transparent 50%), radial-gradient(at 80% 100%, rgb(165 180 252 / 0.45) 0px, transparent 50%)",
        }}
      />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-soft">
            <SparkleIcon size={18} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900">Aplikasi Cuti</span>
            <span className="text-[11px] text-slate-500">Admin Login</span>
          </div>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Kembali ke form
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] max-w-6xl items-center justify-center px-4 pb-10">
        <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-center">
          <div className="hidden lg:block">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-brand-700 shadow-soft ring-1 ring-inset ring-brand-100 backdrop-blur">
                <ShieldIcon size={12} />
                Khusus Administrator
              </span>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900">
                Kelola pengajuan cuti{" "}
                <span className="bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">
                  dengan rapi
                </span>
              </h1>
              <p className="text-base leading-relaxed text-slate-600">
                Tinjau, setujui, atau tolak pengajuan cuti karyawan. Lihat rekap bulanan dan
                ekspor laporan ke CSV langsung dari satu panel.
              </p>
              <ul className="space-y-2.5 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon size={16} className="text-emerald-600" />
                  Dashboard ringkas dengan filter & pencarian
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon size={16} className="text-emerald-600" />
                  Preview & download bukti dukung
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon size={16} className="text-emerald-600" />
                  Rekap bulanan + ekspor CSV (Excel)
                </li>
              </ul>
            </div>
          </div>

          <Card className="mx-auto w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-6 py-6 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 ring-1 ring-inset ring-white/20">
                  <ShieldIcon size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Login Admin</h2>
                  <p className="text-xs text-brand-50/90">
                    Masuk untuk mengelola pengajuan cuti.
                  </p>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <Suspense fallback={null}>
                <LoginForm />
              </Suspense>
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                <p className="font-semibold text-slate-700">Akun default</p>
                <p className="mt-1">
                  Username: <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] ring-1 ring-slate-200">admin</code>
                  {" · "}
                  Password: <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] ring-1 ring-slate-200">admin123</code>
                </p>
                <p className="mt-1.5 text-slate-500">
                  Disarankan ganti password di menu <span className="font-medium text-slate-700">Akun</span> setelah login pertama.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
