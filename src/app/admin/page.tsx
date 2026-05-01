import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatDate,
  formatDateTime,
  LEAVE_TYPE_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
} from "@/lib/utils";
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
      <div>
        <h1 className="text-2xl font-bold">Pengajuan Cuti</h1>
        <p className="text-sm text-slate-500">
          Daftar seluruh pengajuan cuti karyawan.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <SummaryCard label="Total" value={total} />
        <SummaryCard label="Menunggu" value={summary.PENDING} tone="amber" />
        <SummaryCard label="Disetujui" value={summary.APPROVED} tone="emerald" />
        <SummaryCard label="Ditolak" value={summary.REJECTED} tone="rose" />
      </div>

      <Card>
        <form className="flex flex-wrap items-end gap-3 p-4">
          <div>
            <label className="block text-xs font-medium text-slate-600">Cari</label>
            <input
              name="q"
              defaultValue={q}
              placeholder="Nama / NIP / departemen"
              className="mt-1 h-9 rounded-md border border-slate-300 px-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Status</label>
            <select
              name="status"
              defaultValue={status ?? ""}
              className="mt-1 h-9 rounded-md border border-slate-300 px-2 text-sm"
            >
              <option value="">Semua</option>
              {VALID_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Jenis Cuti</label>
            <select
              name="jenis"
              defaultValue={jenis ?? ""}
              className="mt-1 h-9 rounded-md border border-slate-300 px-2 text-sm"
            >
              <option value="">Semua</option>
              {VALID_TYPES.map((t) => (
                <option key={t} value={t}>
                  {LEAVE_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Bulan</label>
            <input
              type="month"
              name="bulan"
              defaultValue={bulan}
              className="mt-1 h-9 rounded-md border border-slate-300 px-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="h-9 rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Filter
            </button>
            <Link
              href="/admin"
              className="flex h-9 items-center rounded-md border border-slate-300 px-3 text-sm font-medium hover:bg-slate-100"
            >
              Reset
            </Link>
          </div>
        </form>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50 text-left text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3">Tanggal Ajuan</th>
                  <th className="px-4 py-3">Nama / NIP</th>
                  <th className="px-4 py-3">Departemen</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">Periode</th>
                  <th className="px-4 py-3">Hari</th>
                  <th className="px-4 py-3">Bukti</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                      Belum ada pengajuan.
                    </td>
                  </tr>
                )}
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 align-top text-slate-600">
                      {formatDateTime(it.createdAt)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium">{it.nama}</div>
                      <div className="text-xs text-slate-500">{it.nip}</div>
                    </td>
                    <td className="px-4 py-3 align-top">{it.departemen}</td>
                    <td className="px-4 py-3 align-top">
                      {LEAVE_TYPE_LABEL[it.jenisCuti]}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div>{formatDate(it.tanggalMulai)}</div>
                      <div className="text-xs text-slate-500">
                        s/d {formatDate(it.tanggalSelesai)}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">{it.jumlahHari}</td>
                    <td className="px-4 py-3 align-top">{it._count.attachments}</td>
                    <td className="px-4 py-3 align-top">
                      <Badge className={STATUS_COLOR[it.status]}>
                        {STATUS_LABEL[it.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Link
                        href={`/admin/${it.id}`}
                        className="text-sm font-medium text-slate-900 underline"
                      >
                        Detail
                      </Link>
                    </td>
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

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "amber" | "emerald" | "rose";
}) {
  const toneClass =
    tone === "amber"
      ? "text-amber-700"
      : tone === "emerald"
        ? "text-emerald-700"
        : tone === "rose"
          ? "text-rose-700"
          : "text-slate-900";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase text-slate-500">{label}</div>
        <div className={`mt-1 text-2xl font-bold ${toneClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
