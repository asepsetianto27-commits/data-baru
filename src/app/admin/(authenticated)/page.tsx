import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatDate,
  formatDateTime,
  LEAVE_TYPE_LABEL,
  STATUS_LABEL,
} from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import {
  ArrowRightIcon,
  ChartIcon,
  CheckCircleIcon,
  FileIcon,
  HourglassIcon,
  InboxIcon,
  SearchIcon,
  XCircleIcon,
} from "@/components/ui/icons";
import type { LeaveStatus, LeaveType } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    bulan?: string;
    q?: string;
    jenis?: string;
  }>;
}

const VALID_STATUSES: LeaveStatus[] = ["PENDING", "APPROVED", "REJECTED"];
const VALID_TYPES: LeaveType[] = [
  "TAHUNAN",
  "SAKIT",
  "MELAHIRKAN",
  "PENTING",
  "TANPA_GAJI",
  "LAINNYA",
];

export default async function AdminListPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const status = VALID_STATUSES.includes(sp.status as LeaveStatus)
    ? (sp.status as LeaveStatus)
    : undefined;
  const jenis = VALID_TYPES.includes(sp.jenis as LeaveType)
    ? (sp.jenis as LeaveType)
    : undefined;
  const q = sp.q?.trim() ?? "";
  const bulan = sp.bulan?.match(/^\d{4}-\d{2}$/) ? sp.bulan : "";

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (jenis) where.jenisCuti = jenis;
  if (q) {
    where.OR = [
      { nama: { contains: q, mode: "insensitive" } },
      { nip: { contains: q, mode: "insensitive" } },
      { departemen: { contains: q, mode: "insensitive" } },
    ];
  }
  if (bulan) {
    const [y, m] = bulan.split("-").map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);
    where.createdAt = { gte: start, lt: end };
  }

  const hasFilter = Boolean(status || jenis || q || bulan);

  const [items, counts] = await Promise.all([
    prisma.leaveRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { attachments: true } } },
      take: 200,
    }),
    prisma.leaveRequest.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const summary = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  } as Record<LeaveStatus, number>;
  for (const c of counts) summary[c.status] = c._count._all;
  const total = summary.PENDING + summary.APPROVED + summary.REJECTED;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pengajuan Cuti
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tinjau & kelola seluruh pengajuan cuti karyawan.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Pengajuan"
          value={total}
          icon={<ChartIcon size={18} />}
          tone="slate"
        />
        <SummaryCard
          label="Menunggu"
          value={summary.PENDING}
          icon={<HourglassIcon size={18} />}
          tone="amber"
        />
        <SummaryCard
          label="Disetujui"
          value={summary.APPROVED}
          icon={<CheckCircleIcon size={18} />}
          tone="emerald"
        />
        <SummaryCard
          label="Ditolak"
          value={summary.REJECTED}
          icon={<XCircleIcon size={18} />}
          tone="rose"
        />
      </div>

      <Card>
        <form className="grid gap-3 p-4 sm:grid-cols-12">
          <div className="sm:col-span-5">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Cari
            </label>
            <div className="relative">
              <SearchIcon
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                name="q"
                defaultValue={q}
                placeholder="Nama, NIP, atau departemen"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm transition-colors hover:border-slate-300 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Status
            </label>
            <select
              name="status"
              defaultValue={status ?? ""}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm transition-colors hover:border-slate-300 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15"
            >
              <option value="">Semua</option>
              {VALID_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Jenis
            </label>
            <select
              name="jenis"
              defaultValue={jenis ?? ""}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm transition-colors hover:border-slate-300 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15"
            >
              <option value="">Semua</option>
              {VALID_TYPES.map((t) => (
                <option key={t} value={t}>
                  {LEAVE_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Bulan
            </label>
            <input
              type="month"
              name="bulan"
              defaultValue={bulan}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm transition-colors hover:border-slate-300 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15"
            />
          </div>
          <div className="flex items-end gap-2 sm:col-span-1">
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-brand-600 px-3 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-700 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Filter
            </button>
          </div>
          {hasFilter && (
            <div className="sm:col-span-12 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Menampilkan {items.length} hasil sesuai filter aktif.
              </p>
              <Link
                href="/admin"
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                Reset filter
              </Link>
            </div>
          )}
        </form>
      </Card>

      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <EmptyState filtered={hasFilter} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Tanggal Ajuan</th>
                    <th className="px-4 py-3">Pengaju</th>
                    <th className="px-4 py-3">Departemen</th>
                    <th className="px-4 py-3">Jenis</th>
                    <th className="px-4 py-3">Periode</th>
                    <th className="px-4 py-3 text-center">Hari</th>
                    <th className="px-4 py-3 text-center">Bukti</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it) => (
                    <tr
                      key={it.id}
                      className="group transition-colors hover:bg-brand-50/40"
                    >
                      <td className="px-4 py-3.5 align-top text-slate-500">
                        <span className="text-xs">{formatDateTime(it.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <div className="font-medium text-slate-900">{it.nama}</div>
                        <div className="text-xs text-slate-500">{it.nip}</div>
                      </td>
                      <td className="px-4 py-3.5 align-top text-slate-700">
                        {it.departemen}
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {LEAVE_TYPE_LABEL[it.jenisCuti]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <div className="text-slate-900">{formatDate(it.tanggalMulai)}</div>
                        <div className="text-xs text-slate-500">
                          s/d {formatDate(it.tanggalSelesai)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-top text-center font-semibold text-slate-900">
                        {it.jumlahHari}
                      </td>
                      <td className="px-4 py-3.5 align-top text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          <FileIcon size={12} />
                          {it._count.attachments}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <StatusBadge status={it.status} />
                      </td>
                      <td className="px-4 py-3.5 align-top text-right">
                        <Link
                          href={`/admin/${it.id}`}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-brand-700 transition-colors group-hover:bg-white hover:bg-white"
                        >
                          Detail
                          <ArrowRightIcon size={12} />
                        </Link>
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

const TONE_CLASSES = {
  slate: {
    bg: "bg-slate-50 text-slate-700 ring-slate-200",
    value: "text-slate-900",
  },
  amber: {
    bg: "bg-amber-50 text-amber-700 ring-amber-200",
    value: "text-amber-700",
  },
  emerald: {
    bg: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    value: "text-emerald-700",
  },
  rose: {
    bg: "bg-rose-50 text-rose-700 ring-rose-200",
    value: "text-rose-700",
  },
} as const;

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: keyof typeof TONE_CLASSES;
}) {
  const t = TONE_CLASSES[tone];
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${t.bg}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className={`mt-0.5 text-2xl font-bold leading-none ${t.value}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <InboxIcon size={26} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {filtered ? "Tidak ada hasil" : "Belum ada pengajuan"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {filtered
            ? "Coba ubah kombinasi filter atau reset filter untuk melihat semua data."
            : "Pengajuan dari karyawan akan muncul di sini secara otomatis."}
        </p>
      </div>
      {filtered && (
        <Link
          href="/admin"
          className="mt-1 inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Reset filter
        </Link>
      )}
    </div>
  );
}
