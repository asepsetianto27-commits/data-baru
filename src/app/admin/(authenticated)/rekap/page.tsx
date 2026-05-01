import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import {
  CalendarIcon,
  ChartIcon,
  CheckCircleIcon,
  DownloadIcon,
  InboxIcon,
} from "@/components/ui/icons";
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

const STATUS_TONE: Record<string, string> = {
  PENDING: "text-amber-700",
  APPROVED: "text-emerald-700",
  REJECTED: "text-rose-700",
};

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

  const monthLabel = start.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Rekap Bulanan
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Ringkasan pengajuan cuti per bulan & ekspor laporan.
          </p>
        </div>
        <form className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Bulan
            </label>
            <input
              type="month"
              name="bulan"
              defaultValue={bulan}
              className="h-10 w-44 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm transition-colors hover:border-slate-300 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-700 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Tampilkan
          </button>
          <a
            href={`/api/admin/export?bulan=${encodeURIComponent(bulan)}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-soft transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <DownloadIcon size={14} />
            Export CSV
          </a>
        </form>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryTile
          icon={<ChartIcon size={18} className="text-brand-600" />}
          label="Total Pengajuan"
          value={items.length}
        >
          <div className="mt-3 space-y-1.5 text-xs">
            {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
              <div key={s} className="flex items-center justify-between">
                <span className="text-slate-500">{STATUS_LABEL[s]}</span>
                <span className={`font-semibold ${STATUS_TONE[s] ?? "text-slate-700"}`}>
                  {totalsByStatus[s] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </SummaryTile>

        <SummaryTile
          icon={<CalendarIcon size={18} className="text-brand-600" />}
          label="Per Jenis Cuti"
          value={Object.values(totalsByType).reduce((a, b) => a + b, 0)}
        >
          {Object.keys(totalsByType).length === 0 ? (
            <p className="mt-3 text-xs text-slate-500">Tidak ada data.</p>
          ) : (
            <div className="mt-3 space-y-1.5 text-xs">
              {Object.entries(totalsByType).map(([t, n]) => (
                <div key={t} className="flex items-center justify-between">
                  <span className="text-slate-500">
                    {LEAVE_TYPE_LABEL[t] ?? t}
                  </span>
                  <span className="font-semibold text-slate-900">{n}</span>
                </div>
              ))}
            </div>
          )}
        </SummaryTile>

        <SummaryTile
          icon={<CheckCircleIcon size={18} className="text-emerald-600" />}
          label="Total Hari Disetujui"
          value={totalHari}
          accent="emerald"
        >
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Akumulasi <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px]">jumlahHari</code> untuk pengajuan
            yang telah disetujui di bulan ini.
          </p>
        </SummaryTile>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle>Detail {monthLabel}</CardTitle>
          <span className="text-xs text-slate-500">
            {items.length} pengajuan
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <InboxIcon size={26} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Tidak ada pengajuan
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Belum ada pengajuan cuti pada bulan {monthLabel}.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Tanggal Ajuan</th>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">NIP</th>
                    <th className="px-4 py-3">Departemen</th>
                    <th className="px-4 py-3">Jenis</th>
                    <th className="px-4 py-3">Periode</th>
                    <th className="px-4 py-3 text-center">Hari</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it) => (
                    <tr
                      key={it.id}
                      className="transition-colors hover:bg-brand-50/40"
                    >
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDate(it.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {it.nama}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{it.nip}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {it.departemen}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {LEAVE_TYPE_LABEL[it.jenisCuti]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatDate(it.tanggalMulai)} – {formatDate(it.tanggalSelesai)}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-900">
                        {it.jumlahHari}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={it.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryTile({
  icon,
  label,
  value,
  accent,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: "emerald";
  children?: React.ReactNode;
}) {
  const valueColor = accent === "emerald" ? "text-emerald-700" : "text-slate-900";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 ring-1 ring-inset ring-brand-100">
            {icon}
          </span>
        </div>
        <p className={`mt-2 text-3xl font-bold leading-none ${valueColor}`}>
          {value}
        </p>
        {children}
      </CardContent>
    </Card>
  );
}
