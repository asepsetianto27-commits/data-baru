import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  createSession,
  ensureDefaultAdmin,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
  }

  await ensureDefaultAdmin();

  const user = await prisma.adminUser.findUnique({
    where: { username: parsed.data.username },
  });
  if (!user) {
    return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
  }

  const token = await createSession({
    sub: user.id,
    username: user.username,
    name: user.name,
  });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
