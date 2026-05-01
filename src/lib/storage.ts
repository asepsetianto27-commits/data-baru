import { put, del } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export interface StoredFile {
  storageKind: "blob" | "local";
  storagePath: string; // URL (blob) or relative path under /uploads (local)
  fileName: string;
  fileType: string;
  fileSize: number;
}

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_FILES_PER_REQUEST = 3;

export function isAllowedMime(mime: string): boolean {
  return ALLOWED_MIME.has(mime.toLowerCase());
}

export function safeExtension(fileName: string, fallback = "bin"): string {
  const ext = path.extname(fileName).replace(/^\./, "").toLowerCase();
  return /^[a-z0-9]{1,8}$/.test(ext) ? ext : fallback;
}

function shouldUseBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function saveUpload(file: File): Promise<StoredFile> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const id = crypto.randomUUID();
  const ext = safeExtension(file.name);
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const key = `cuti/${yyyy}/${mm}/${id}.${ext}`;

  if (shouldUseBlob()) {
    const result = await put(key, buffer, {
      access: "public",
      contentType: file.type || "application/octet-stream",
    });
    return {
      storageKind: "blob",
      storagePath: result.url,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    };
  }

  const uploadsDir = path.join(process.cwd(), "uploads", yyyy, mm);
  await fs.mkdir(uploadsDir, { recursive: true });
  const fullPath = path.join(uploadsDir, `${id}.${ext}`);
  await fs.writeFile(fullPath, buffer);

  return {
    storageKind: "local",
    storagePath: path.posix.join(yyyy, mm, `${id}.${ext}`),
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  };
}

export async function deleteUpload(stored: { storageKind: string; storagePath: string }) {
  try {
    if (stored.storageKind === "blob") {
      await del(stored.storagePath);
    } else {
      const fullPath = path.join(process.cwd(), "uploads", stored.storagePath);
      await fs.unlink(fullPath);
    }
  } catch {
    // best-effort
  }
}

export async function readLocalFile(relativePath: string): Promise<Buffer> {
  const fullPath = path.join(process.cwd(), "uploads", relativePath);
  return fs.readFile(fullPath);
}
