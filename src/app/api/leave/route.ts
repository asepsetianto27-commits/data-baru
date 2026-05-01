import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  isAllowedMime,
  saveUpload,
  MAX_FILE_BYTES,
  MAX_FILES_PER_REQUEST,
  deleteUpload,
} from "@/lib/storage";
import { diffDaysInclusive } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LeaveTypeEnum = z.enum([
  "TAHUNAN",
  "SAKIT",
  "MELAHIRKAN",
  "PENTING",
  "TANPA_GAJI",
  "LAINNYA",
]);

const schema = z.object({
  nama: z.string().trim().min(2).max(120),
  nip: z.string().trim().min(1).max(50),
  departemen: z.string().trim().min(1).max(120),
  jenisCuti: LeaveTypeEnum,
  tanggalMulai: z.string().min(1),
  tanggalSelesai: z.string().min(1),
  alasan: z.string().trim().min(3).max(1000),
});

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const raw = {
    nama: formData.get("nama"),
    nip: formData.get("nip"),
    departemen: formData.get("departemen"),
    jenisCuti: formData.get("jenisCuti"),
    tanggalMulai: formData.get("tanggalMulai"),
    tanggalSelesai: formData.get("tanggalSelesai"),
    alasan: formData.get("alasan"),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak lengkap atau tidak valid", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const start = new Date(parsed.data.tanggalMulai);
  const end = new Date(parsed.data.tanggalSelesai);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return NextResponse.json({ error: "Tanggal tidak valid" }, { status: 400 });
  }
  if (end < start) {
    return NextResponse.json(
      { error: "Tanggal selesai harus lebih besar atau sama dengan tanggal mulai" },
      { status: 400 },
    );
  }

  const jumlahHari = diffDaysInclusive(start, end);

  const attachments = formData.getAll("attachments").filter((v): v is File => v instanceof File);
  if (attachments.length === 0) {
    return NextResponse.json(
      { error: "Lampirkan minimal 1 file bukti dukung" },
      { status: 400 },
    );
  }
  if (attachments.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json(
      { error: `Maksimal ${MAX_FILES_PER_REQUEST} file` },
      { status: 400 },
    );
  }
  for (const f of attachments) {
    if (!isAllowedMime(f.type)) {
      return NextResponse.json(
        { error: `Tipe file tidak didukung: ${f.name}` },
        { status: 400 },
      );
    }
    if (f.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `File ${f.name} melebihi 5 MB` },
        { status: 400 },
      );
    }
  }

  const stored: Array<Awaited<ReturnType<typeof saveUpload>>> = [];
  try {
    for (const f of attachments) {
      stored.push(await saveUpload(f));
    }

    const created = await prisma.leaveRequest.create({
      data: {
        nama: parsed.data.nama,
        nip: parsed.data.nip,
        departemen: parsed.data.departemen,
        jenisCuti: parsed.data.jenisCuti,
        tanggalMulai: start,
        tanggalSelesai: end,
        jumlahHari,
        alasan: parsed.data.alasan,
        attachments: {
          create: stored.map((s) => ({
            fileName: s.fileName,
            fileType: s.fileType,
            fileSize: s.fileSize,
            storageKind: s.storageKind,
            storagePath: s.storagePath,
          })),
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (err) {
    // rollback uploaded files
    await Promise.all(stored.map((s) => deleteUpload(s)));
    // eslint-disable-next-line no-console
    console.error("[/api/leave] failed:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan pengajuan. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
