import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import type { LeaveStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  action: z.enum(["approve", "reject", "reset"]),
  catatan: z.string().max(1000).optional().nullable(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 400 });
  }

  const existing = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

  let nextStatus: LeaveStatus;
  if (parsed.data.action === "approve") nextStatus = "APPROVED";
  else if (parsed.data.action === "reject") nextStatus = "REJECTED";
  else nextStatus = "PENDING";

  const isReset = parsed.data.action === "reset";

  await prisma.leaveRequest.update({
    where: { id },
    data: {
      status: nextStatus,
      catatanAdmin: parsed.data.catatan ?? null,
      reviewedAt: isReset ? null : new Date(),
      reviewedBy: isReset ? null : admin.username,
    },
  });

  return NextResponse.json({ ok: true });
}
