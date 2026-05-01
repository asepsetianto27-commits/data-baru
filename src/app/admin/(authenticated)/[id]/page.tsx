import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewActions } from "./review-actions";
import { StatusBadge } from "@/components/status-badge";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  DownloadIcon,
  FileIcon,
  FilePdfIcon,
  ImageIcon,
} from "@/components/ui/icons";
import {
  formatBytes,
  formatDate,
  formatDateTime,
  LEAVE_TYPE_LABEL,
} from "@/lib/utils";

function attachmentIcon(type: string) {
  if (type === "application/pdf") return <FilePdfIcon size={18} className="text-rose-600" />;
  if (type.startsWith("image/")) return <ImageIcon size={18} className="text-brand-600" />;
  return <FileIcon size={18} className="text-slate-500" />;
}

export default async function LeaveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.leaveRequest.findUnique({
    where: { id },
    include: { attachments: true },
  });
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeftIcon size={14} />
            Kembali ke daftar
          </Link>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
            {item.nama}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {item.departemen} · NIP {item.nip}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={item.status} className="text-sm" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pengajuan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat
                  icon={<CalendarIcon size={16} className="text-brand-600" />}
                  label="Tanggal Mulai"
                  value={formatDate(item.tanggalMulai)}
                />
                <Stat
                  icon={<CalendarIcon size={16} className="text-brand-600" />}
                  label="Tanggal Selesai"
                  value={formatDate(item.tanggalSelesai)}
                />
                <Stat
                  icon={<ClockIcon size={16} className="text-brand-600" />}
                  label="Jumlah Hari"
                  value={`${item.jumlahHari} hari`}
                />
              </div>
              <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
                <Row label="Jenis Cuti">{LEAVE_TYPE_LABEL[item.jenisCuti]}</Row>
                <Row label="Diajukan">{formatDateTime(item.createdAt)}</Row>
                <div className="sm:col-span-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Alasan
                  </dt>
                  <dd className="mt-1.5 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-800">
                    {item.alasan}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Bukti Dukung
                <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {item.attachments.length} file
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {item.attachments.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Tidak ada lampiran.
                </p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {item.attachments.map((a) => (
                    <li
                      key={a.id}
                      className="group flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-brand-300 hover:shadow-card"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-50 ring-1 ring-slate-200">
                          {attachmentIcon(a.fileType)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {a.fileName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {a.fileType.split("/").pop()?.toUpperCase()} ·{" "}
                            {formatBytes(a.fileSize)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`/api/admin/attachments/${a.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                      >
                        <DownloadIcon size={12} />
                        Lihat
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="self-start lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>Tindakan Tinjauan</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewActions
              id={item.id}
              status={item.status}
              catatanAdmin={item.catatanAdmin}
              reviewedAt={item.reviewedAt}
              reviewedBy={item.reviewedBy}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-900">{children}</dd>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-1.5 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
