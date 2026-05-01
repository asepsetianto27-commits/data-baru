import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewActions } from "./review-actions";
import {
  formatBytes,
  formatDate,
  formatDateTime,
  LEAVE_TYPE_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
} from "@/lib/utils";

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
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-slate-500 hover:underline">
            ← Kembali
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Detail Pengajuan</h1>
        </div>
        <Badge className={STATUS_COLOR[item.status]}>
          {STATUS_LABEL[item.status]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Data Pengaju</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Row label="Nama">{item.nama}</Row>
              <Row label="NIP / ID">{item.nip}</Row>
              <Row label="Departemen">{item.departemen}</Row>
              <Row label="Jenis Cuti">{LEAVE_TYPE_LABEL[item.jenisCuti]}</Row>
              <Row label="Tanggal Mulai">{formatDate(item.tanggalMulai)}</Row>
              <Row label="Tanggal Selesai">{formatDate(item.tanggalSelesai)}</Row>
              <Row label="Jumlah Hari">{item.jumlahHari} hari</Row>
              <Row label="Diajukan">{formatDateTime(item.createdAt)}</Row>
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase text-slate-500">Alasan</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm">{item.alasan}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bukti Dukung</CardTitle>
            </CardHeader>
            <CardContent>
              {item.attachments.length === 0 ? (
                <p className="text-sm text-slate-500">Tidak ada lampiran.</p>
              ) : (
                <ul className="space-y-2">
                  {item.attachments.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{a.fileName}</div>
                        <div className="text-xs text-slate-500">
                          {a.fileType} · {formatBytes(a.fileSize)}
                        </div>
                      </div>
                      <a
                        href={`/api/admin/attachments/${a.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-3 shrink-0 text-sm font-medium text-slate-900 underline"
                      >
                        Lihat
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tindakan</CardTitle>
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
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}
