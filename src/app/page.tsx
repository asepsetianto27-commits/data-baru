import Link from "next/link";
import { LeaveRequestForm } from "@/components/leave-request-form";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircleIcon,
  ClockIcon,
  ShieldIcon,
  SparkleIcon,
} from "@/components/ui/icons";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-soft">
              <SparkleIcon size={18} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-900">Aplikasi Cuti</span>
              <span className="text-[11px] text-slate-500">Pengajuan cuti karyawan</span>
            </div>
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-soft transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            <ShieldIcon size={16} className="text-brand-600" />
            Login Admin
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <aside className="space-y-6">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-100">
                <SparkleIcon size={12} />
                Form Pengajuan Cuti
              </span>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Ajukan cuti dengan{" "}
                <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                  cepat & rapi
                </span>
              </h1>
              <p className="text-base leading-relaxed text-slate-600">
                Isi data, lampirkan bukti dukung, dan kirim. Pengajuan otomatis tercatat dan akan
                ditinjau oleh admin.
              </p>
            </div>

            <ul className="space-y-3">
              <Feature
                icon={<CheckCircleIcon size={16} />}
                title="Tanpa registrasi"
                desc="Cukup isi form — tidak perlu membuat akun."
              />
              <Feature
                icon={<ClockIcon size={16} />}
                title="Real-time ke admin"
                desc="Pengajuan langsung muncul di dashboard admin."
              />
              <Feature
                icon={<ShieldIcon size={16} />}
                title="Aman & terverifikasi"
                desc="Data tersimpan aman, hanya admin yang dapat meninjau."
              />
            </ul>

            <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-sm text-brand-900">
              <p className="font-semibold">Tip pengisian</p>
              <p className="mt-1 text-brand-800/90">
                Lampirkan bukti pendukung yang relevan (surat dokter, undangan, dsb.) agar
                pengajuan cepat disetujui.
              </p>
            </div>
          </aside>

          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-6 py-5 text-white">
              <h2 className="text-lg font-semibold">Form Pengajuan</h2>
              <p className="mt-1 text-sm text-brand-50/90">
                Isi semua kolom dengan benar. PDF/JPG/PNG, maks. 5 MB per file.
              </p>
            </div>
            <CardContent className="p-6 pt-6 sm:p-8">
              <LeaveRequestForm />
            </CardContent>
          </Card>
        </div>

        <p className="mt-10 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Aplikasi Pengajuan Cuti · Dibuat untuk mempermudah proses
          administrasi cuti.
        </p>
      </main>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-lg border border-slate-200/80 bg-white p-3 shadow-soft">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        {icon}
      </span>
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs leading-relaxed text-slate-500">{desc}</p>
      </div>
    </li>
  );
}
