"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircleIcon, XCircleIcon } from "@/components/ui/icons";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next !== confirm) {
      setMsg({ kind: "err", text: "Konfirmasi password tidak cocok" });
      return;
    }
    if (next.length < 6) {
      setMsg({ kind: "err", text: "Password baru minimal 6 karakter" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ kind: "err", text: data?.error ?? "Gagal mengubah password" });
        return;
      }
      setMsg({ kind: "ok", text: "Password berhasil diubah." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch {
      setMsg({ kind: "err", text: "Terjadi kesalahan jaringan" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-xl gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="current">Password Saat Ini</Label>
        <Input
          id="current"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="new">Password Baru</Label>
          <Input
            id="new"
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            minLength={6}
            placeholder="Minimal 6 karakter"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Konfirmasi Password Baru</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            placeholder="Ulangi password baru"
          />
        </div>
      </div>
      {msg && (
        <p
          className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
            msg.kind === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {msg.kind === "ok" ? (
            <CheckCircleIcon size={16} className="mt-0.5 shrink-0" />
          ) : (
            <XCircleIcon size={16} className="mt-0.5 shrink-0" />
          )}
          <span>{msg.text}</span>
        </p>
      )}
      <div>
        <Button type="submit" disabled={loading}>
          {loading ? "Memproses..." : "Simpan Password Baru"}
        </Button>
      </div>
    </form>
  );
}
