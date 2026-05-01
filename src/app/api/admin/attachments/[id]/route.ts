import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { readLocalFile } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const att = await prisma.leaveAttachment.findUnique({ where: { id } });
  if (!att) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

  if (att.storageKind === "blob") {
    return NextResponse.redirect(att.storagePath, 302);
  }

  try {
    const buf = await readLocalFile(att.storagePath);
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": att.fileType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(att.fileName)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "File tidak dapat dibaca" }, { status: 404 });
  }
}
