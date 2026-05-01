"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/toast";
import { LEAVE_TYPE_LABEL, formatBytes } from "@/lib/utils";

const MAX_FILES = 3;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "application/pdf,image/jpeg,image/png";

export function LeaveRequestForm() {
  const { show } = useToast();
  const [submitting, setSubmitting] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [submitted, setSubmitted] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  function onFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const next: File[] = [];
    for (const f of picked) {
      if (!ACCEPT.split(",").includes(f.type)) {
        show({
          title: "Tipe file tidak didukung",
          description: `${f.name} bukan PDF/JPG/PNG`,
          variant: "error",
        });
        continue;
      }
      if (f.size > MAX_BYTES) {
        show({
          title: "File terlalu besar",
          description: `${f.name} (${formatBytes(f.size)}) melebihi 5 MB`,
          variant: "error",
        });
        continue;
      }
      next.push(f);
    }
    const combined = [...files, ...next].slice(0, MAX_FILES);
    setFiles(combined);
    e.target.value = "";
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const form = e.currentTarget;
    const fd = new FormData(form);
    if (files.length === 0) {
      show({
        title: "Bukti dukung wajib diunggah",
        description: "Silakan lampirkan minimal 1 file (PDF/JPG/PNG).",
        variant: "error",
      });
      return;
    }
    files.forEach((f) => fd.append("attachments", f));

    setSubmitting(true);
    try {
      const res = await fetch("/api/leave", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Gagal mengirim pengajuan");
      }
      show({
        title: "Pengajuan berhasil dikirim",
        description: "Data Anda telah diteruskan ke admin untuk ditinjau.",
        variant: "success",
      });
      form.reset();
      setFiles([]);
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      show({ title: "Gagal mengirim", description: msg, variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
          ✓
        </div>
        <div>
          <h3 className="text-lg font-semibold">Pengajuan Terkirim</h3>
          <p className="mt-1 text-sm text-slate-600">
            Pengajuan cuti Anda telah dikirim ke admin untuk ditinjau.
          </p>
        </div>
        <Button variant="outline" onClick={() => setSubmitted(false)}>
          Kirim Pengajuan Baru
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="nama">Nama Lengkap</Label>
          <Input id="nama" name="nama" required maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nip">NIP / ID Karyawan</Label>
          <Input id="nip" name="nip" required maxLength={50} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="departemen">Departemen / Unit</Label>
          <Input id="departemen" name="departemen" required maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jenisCuti">Jenis Cuti</Label>
          <Select id="jenisCuti" name="jenisCuti" required defaultValue="TAHUNAN">
            {Object.entries(LEAVE_TYPE_LABEL).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="tanggalMulai">Tanggal Mulai</Label>
          <Input id="tanggalMulai" name="tanggalMulai" type="date" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tanggalSelesai">Tanggal Selesai</Label>
          <Input id="tanggalSelesai" name="tanggalSelesai" type="date" required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="alasan">Alasan Cuti</Label>
        <Textarea id="alasan" name="alasan" required rows={4} maxLength={1000} />
      </div>

      <div className="space-y-2">
        <Label>Bukti Dukung (PDF/JPG/PNG, maks. 5 MB, hingga {MAX_FILES} file)</Label>
        <input
          type="file"
          accept={ACCEPT}
          multiple
          onChange={onFilesPicked}
          disabled={files.length >= MAX_FILES}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
        />
        {files.length > 0 && (
          <ul className="divide-y rounded-md border border-slate-200 bg-slate-50">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="truncate">
                  {f.name} <span className="text-slate-500">({formatBytes(f.size)})</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-rose-600 hover:underline"
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting} size="lg">
          {submitting ? "Mengirim..." : "Kirim Pengajuan"}
        </Button>
      </div>
    </form>
  );
}
