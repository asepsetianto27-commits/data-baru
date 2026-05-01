import Link from "next/link";
import { LeaveRequestForm } from "@/components/leave-request-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold">Aplikasi Pengajuan Cuti</h1>
            <p className="text-xs text-slate-500">Form pengajuan cuti karyawan</p>
          </div>
          <Link
            href="/admin/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Login Admin
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Form Pengajuan Cuti</CardTitle>
            <CardDescription>
              Isi data berikut dengan lengkap dan lampirkan bukti dukung (PDF/JPG/PNG, maks. 5 MB
              per file, maks. 3 file).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LeaveRequestForm />
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-500">
          Pengajuan akan otomatis masuk ke dashboard admin untuk ditinjau.
        </p>
      </main>
    </div>
  );
}
