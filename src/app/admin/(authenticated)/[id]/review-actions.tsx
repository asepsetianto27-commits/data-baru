"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "@/components/ui/icons";
import type { LeaveStatus } from "@prisma/client";
import { formatDateTime } from "@/lib/utils";

interface Props {
  id: string;
  status: LeaveStatus;
  catatanAdmin: string | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
}

export function ReviewActions({ id, status, catatanAdmin, reviewedAt, reviewedBy }: Props) {
  const router = useRouter();
  const [note, setNote] = useState(catatanAdmin ?? "");
  const [loading, setLoading] = useState<"approve" | "reject" | "reset" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "approve" | "reject" | "reset") {
    setError(null);
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/leave/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, catatan: note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Gagal memperbarui status");
        return;
      }
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {reviewedAt && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
          <span className="font-medium text-slate-800">Riwayat tinjauan</span>
          <br />
          Ditinjau {reviewedBy ? `oleh ${reviewedBy} ` : ""}pada {formatDateTime(reviewedAt)}.
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="catatan">Catatan Admin (opsional)</Label>
        <Textarea
          id="catatan"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Mis. alasan persetujuan / penolakan"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Button
          variant="success"
          disabled={loading !== null}
          onClick={() => act("approve")}
          className="w-full"
        >
          <CheckCircleIcon size={16} />
          {loading === "approve" ? "Memproses..." : "Setujui Pengajuan"}
        </Button>
        <Button
          variant="destructive"
          disabled={loading !== null}
          onClick={() => act("reject")}
          className="w-full"
        >
          <XCircleIcon size={16} />
          {loading === "reject" ? "Memproses..." : "Tolak Pengajuan"}
        </Button>
        {status !== "PENDING" && (
          <Button
            variant="outline"
            disabled={loading !== null}
            onClick={() => act("reset")}
            className="w-full"
          >
            <ClockIcon size={16} />
            {loading === "reset" ? "Memproses..." : "Set Kembali ke Pending"}
          </Button>
        )}
      </div>
    </div>
  );
}
