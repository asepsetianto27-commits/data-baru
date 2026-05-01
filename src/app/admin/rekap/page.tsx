import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatDate,
  LEAVE_TYPE_LABEL,
  STATUS_LABEL,
} from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ bulan?: string }>;
}

function defaultMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function RekapPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const bulan = sp.bulan?.match(/^\d{4}-\d{2}$/) ? sp.bulan : defaultMonth();
  const [y, m] = bulan.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);

  const items = await prisma.leaveRequest.findMany({
    where: { createdAt: { gte: start, lt: end } },
    orderBy: { createdAt: "asc" },
  });

  const totalsByType: Record<string, number> = {};
  const totalsByStatus: Record<string, number> = {};
  let totalHari = 0;
  for (const it of items) {
    totalsByType[it.jenisCuti] = (totalsByType[it.jenisCuti] ?? 0) + 1;
    totalsByStatus[it.status] = (totalsByStatus[it.status] ?? 0) + 1;
    if (it.status === "APPROVED") totalHari += it.jumlahHari;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Rekap Bulanan</h1>
          <p className="text-sm text-slate-500">
            Ringkasan pengajuan cuti per bulan.
          </p>
        </div>
        <form className="flex items-end gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-600">Bulan</label>
            <input
              type="month"
              name="bulan"
              defaultValue={bulan}
              className="mt-1 h-9 rounded-md border border-slate-300 px-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="h-9 rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Tampilkan
          </button>
          <a
            href={`/api/admin/export?bulan=${encodeURIComponent(bulan)}`}
            className="h-9 inline-flex items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium hover:bg-slate-100"
          >
            Export CSV
          </a>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Pengajuan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{items.length}</div>
            <div className="mt-2 space-y-1 text-sm">
              {Object.entries(totalsByStatus).map(([s, n]) => (
                <div key={s} className="flex justify-between">
                  <span className="text-slate-600">{STATUS_LABEL[s] ?? s}</span>
                  <span className="font-medium">{n}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Per Jenis Cuti</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(totalsByType).length === 0 ? (
              <p className="text-sm text-slate-500">Tidak ada data.</p>
            ) : (
              <div className="space-y-1 text-sm">
                {Object.entries(totalsByType).map(([t, n]) => (
                  <div key={t} className="flex justify-between">
                    <span className="text-slate-600">{LEAVE_TYPE_LABEL[t] ?? t}</span>
                    <span className="font-medium">{n}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Hari Disetujui</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalHari}</div>
            <p className="mt-2 text-sm text-slate-500">
              Akumulasi <code>jumlahHari</code> untuk pengajuan ber-status Disetujui.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Detail Bulan {start.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50 text-left text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-2">Tanggal Ajuan</th>
                  <th className="px-4 py-2">Nama</th>
                  <th className="px-4 py-2">NIP</th>
                  <th className="px-4 py-2">Departemen</th>
                  <th className="px-4 py-2">Jenis</th>
                  <th className="px-4 py-2">Periode</th>
                  <th className="px-4 py-2">Hari</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                      Tidak ada pengajuan di bulan ini.
                    </td>
                  </tr>
                )}
                {items.map((it) => (
                  <tr key={it.id}>
                    <td className="px-4 py-2">{formatDate(it.createdAt)}</td>
                    <td className="px-4 py-2">{it.nama}</td>
                    <td className="px-4 py-2">{it.nip}</td>
                    <td className="px-4 py-2">{it.departemen}</td>
                    <td className="px-4 py-2">{LEAVE_TYPE_LABEL[it.jenisCuti]}</td>
                    <td className="px-4 py-2">
                      {formatDate(it.tanggalMulai)} – {formatDate(it.tanggalSelesai)}
                    </td>
                    <td className="px-4 py-2">{it.jumlahHari}</td>
                    <td className="px-4 py-2">{STATUS_LABEL[it.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
