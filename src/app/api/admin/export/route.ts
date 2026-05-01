import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { LEAVE_TYPE_LABEL, STATUS_LABEL } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(v: string): string {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const bulan = url.searchParams.get("bulan");
  const where: Record<string, unknown> = {};
  let suffix = "all";
  if (bulan && /^\d{4}-\d{2}$/.test(bulan)) {
    const [y, m] = bulan.split("-").map(Number);
    where.createdAt = {
      gte: new Date(y, m - 1, 1),
      lt: new Date(y, m, 1),
    };
    suffix = bulan;
  }

  const items = await prisma.leaveRequest.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });

  const headers = [
    "Tanggal Ajuan",
    "Nama",
    "NIP",
    "Departemen",
    "Jenis Cuti",
    "Tanggal Mulai",
    "Tanggal Selesai",
    "Jumlah Hari",
    "Alasan",
    "Status",
    "Catatan Admin",
    "Ditinjau Oleh",
    "Ditinjau Pada",
  ];

  const lines = [headers.map(csvEscape).join(",")];
  for (const it of items) {
    lines.push(
      [
        fmt(it.createdAt),
        it.nama,
        it.nip,
        it.departemen,
        LEAVE_TYPE_LABEL[it.jenisCuti] ?? it.jenisCuti,
        fmt(it.tanggalMulai),
        fmt(it.tanggalSelesai),
        String(it.jumlahHari),
        it.alasan ?? "",
        STATUS_LABEL[it.status] ?? it.status,
        it.catatanAdmin ?? "",
        it.reviewedBy ?? "",
        it.reviewedAt ? it.reviewedAt.toISOString() : "",
      ]
        .map(csvEscape)
        .join(","),
    );
  }

  const body = "\uFEFF" + lines.join("\n");
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rekap-cuti-${suffix}.csv"`,
    },
  });
}
