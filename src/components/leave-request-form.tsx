"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/toast";
import {
  CheckCircleIcon,
  FileIcon,
  FilePdfIcon,
  ImageIcon,
  PaperPlaneIcon,
  TrashIcon,
  UploadIcon,
} from "@/components/ui/icons";
import { LEAVE_TYPE_LABEL, formatBytes } from "@/lib/utils";

const MAX_FILES = 3;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "application/pdf,image/jpeg,image/png";
const ACCEPT_LIST = ACCEPT.split(",");

function fileTypeIcon(type: string) {
  if (type === "application/pdf") return <FilePdfIcon size={20} className="text-rose-600" />;
  if (type.startsWith("image/")) return <ImageIcon size={20} className="text-brand-600" />;
  return <FileIcon size={20} className="text-slate-500" />;
}

function diffDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
  if (e < s) return 0;
  return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function LeaveRequestForm() {
  const { show } = useToast();
  const [submitting, setSubmitting] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [submitted, setSubmitted] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const [tanggalMulai, setTanggalMulai] = React.useState("");
  const [tanggalSelesai, setTanggalSelesai] = React.useState("");
  const formRef = React.useRef<HTMLFormElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const jumlahHari = diffDays(tanggalMulai, tanggalSelesai);

  function addFiles(picked: File[]) {
    const next: File[] = [];
    for (const f of picked) {
      if (!ACCEPT_LIST.includes(f.type)) {
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
    setFiles((prev) => [...prev, ...next].slice(0, MAX_FILES));
  }

  function onFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (files.length >= MAX_FILES) return;
    addFiles(Array.from(e.dataTransfer.files ?? []));
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
      setTanggalMulai("");
      setTanggalSelesai("");
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
      <div className="flex flex-col items-center gap-5 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
          <CheckCircleIcon size={32} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Pengajuan Terkirim</h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
            Pengajuan cuti Anda telah dikirim ke admin untuk ditinjau. Anda akan dihubungi jika
            diperlukan informasi tambahan.
          </p>
        </div>
        <Button variant="outline" onClick={() => setSubmitted(false)}>
          Kirim Pengajuan Baru
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-8">
      <Section
        title="Data Diri"
        subtitle="Identitas pengaju cuti."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama Lengkap" htmlFor="nama">
            <Input id="nama" name="nama" required maxLength={120} placeholder="cth. Asep Setianto" />
          </Field>
          <Field label="NIP / ID Karyawan" htmlFor="nip">
            <Input id="nip" name="nip" required maxLength={50} placeholder="cth. EMP-001" />
          </Field>
          <Field label="Departemen / Unit" htmlFor="departemen">
            <Input
              id="departemen"
              name="departemen"
              required
              maxLength={120}
              placeholder="cth. IT"
            />
          </Field>
          <Field label="Jenis Cuti" htmlFor="jenisCuti">
            <Select id="jenisCuti" name="jenisCuti" required defaultValue="TAHUNAN">
              {Object.entries(LEAVE_TYPE_LABEL).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      <Section
        title="Periode Cuti"
        subtitle="Tentukan rentang tanggal cuti."
        accessory={
          jumlahHari > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-100">
              <CheckCircleIcon size={14} />
              {jumlahHari} hari
            </span>
          ) : null
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tanggal Mulai" htmlFor="tanggalMulai">
            <Input
              id="tanggalMulai"
              name="tanggalMulai"
              type="date"
              required
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
            />
          </Field>
          <Field label="Tanggal Selesai" htmlFor="tanggalSelesai">
            <Input
              id="tanggalSelesai"
              name="tanggalSelesai"
              type="date"
              required
              value={tanggalSelesai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Alasan Cuti" htmlFor="alasan">
          <Textarea
            id="alasan"
            name="alasan"
            required
            rows={4}
            maxLength={1000}
            placeholder="Tulis alasan cuti secukupnya, mis. demam tinggi, kontrol dokter, dsb."
          />
          <p className="mt-1 text-xs text-slate-500">Maksimal 1000 karakter.</p>
        </Field>
      </Section>

      <Section
        title="Bukti Dukung"
        subtitle={`PDF / JPG / PNG, maks. 5 MB per file, hingga ${MAX_FILES} file.`}
      >
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (files.length < MAX_FILES) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            files.length >= MAX_FILES
              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
              : dragOver
                ? "border-brand-500 bg-brand-50/70 text-brand-700"
                : "border-slate-300 bg-slate-50/50 text-slate-600 hover:border-brand-400 hover:bg-brand-50/40 hover:text-brand-700"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-soft ring-1 ring-slate-200">
            <UploadIcon size={20} className="text-brand-600" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {files.length >= MAX_FILES
                ? "Maksimum file tercapai"
                : "Tarik & lepas file di sini, atau klik untuk memilih"}
            </p>
            <p className="text-xs text-slate-500">
              Format: PDF, JPG, PNG · ukuran maks. 5 MB · maks. {MAX_FILES} file
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            multiple
            onChange={onFilesPicked}
            disabled={files.length >= MAX_FILES}
            className="sr-only"
          />
        </div>

        {files.length > 0 && (
          <ul className="space-y-2">
            {files.map((f, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-soft"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-50 ring-1 ring-slate-200">
                    {fileTypeIcon(f.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{f.name}</p>
                    <p className="text-xs text-slate-500">{formatBytes(f.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  aria-label={`Hapus ${f.name}`}
                >
                  <TrashIcon size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="flex flex-col-reverse items-stretch gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Dengan mengirim, Anda menyatakan data yang diberikan benar.
        </p>
        <Button type="submit" disabled={submitting} size="lg">
          <PaperPlaneIcon size={16} />
          {submitting ? "Mengirim..." : "Kirim Pengajuan"}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  subtitle,
  accessory,
  children,
}: {
  title: string;
  subtitle?: string;
  accessory?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {accessory}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
