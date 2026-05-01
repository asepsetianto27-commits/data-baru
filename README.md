# Aplikasi Pengajuan Cuti

Aplikasi web untuk menampung pengajuan cuti bulanan karyawan beserta bukti dukung (PDF/JPG/PNG).
User hanya membuka web → isi form → upload bukti → kirim. Data otomatis masuk ke dashboard admin.

Stack: **Next.js 14 (App Router) · TypeScript · TailwindCSS · Prisma · PostgreSQL · Vercel Blob**.

## Fitur

### Sisi User (publik, tanpa login)
- Form pengajuan cuti: nama, NIP, departemen, jenis cuti, tanggal, alasan
- Upload bukti dukung: PDF/JPG/PNG, maks. 5 MB per file, hingga 3 file
- Notifikasi sukses setelah pengajuan terkirim

### Sisi Admin (login)
- Dashboard ringkas (total, menunggu, disetujui, ditolak)
- Daftar pengajuan + filter (status, jenis cuti, bulan, pencarian nama/NIP/departemen)
- Detail pengajuan + preview/download bukti dukung
- Aksi **Setujui / Tolak / Reset Pending** + catatan admin
- Rekap bulanan + ekspor **CSV** (Excel-compatible)
- Ubah password admin

## Setup Lokal

```bash
# 1. Install dependencies
npm install

# 2. Salin env file
cp .env.example .env

# 3. Isi DATABASE_URL (Postgres) dan AUTH_SECRET di .env
# Contoh AUTH_SECRET: openssl rand -base64 32

# 4. Push schema ke database
npm run db:push

# 5. Jalankan dev server
npm run dev
```

Buka <http://localhost:3000>.

- **Form user**: `/`
- **Login admin**: `/admin/login`
  - Akun default akan dibuat otomatis saat login pertama: **`admin` / `admin123`**.
  - Segera ganti password lewat menu **Akun** setelah login.

Saat dev (tanpa `BLOB_READ_WRITE_TOKEN`), file bukti disimpan di folder `./uploads/`.
Folder ini sudah ada di `.gitignore`.

## Deploy ke Vercel

### 1) Setup Database (Neon / Vercel Postgres)
1. Buka project Anda di Vercel → tab **Storage** → **Create Database** → pilih **Postgres** (Neon).
2. Vercel akan otomatis menambahkan env var `DATABASE_URL` ke project.

### 2) Setup Vercel Blob (penyimpanan file)
1. Di project Vercel → tab **Storage** → **Create Blob Store**.
2. Vercel akan menambahkan `BLOB_READ_WRITE_TOKEN` ke project.

### 3) Set environment variables
Di project Vercel → **Settings → Environment Variables**, tambahkan:

| Variable | Value |
|---|---|
| `DATABASE_URL` | (otomatis dari Neon) |
| `BLOB_READ_WRITE_TOKEN` | (otomatis dari Vercel Blob) |
| `AUTH_SECRET` | string acak min. 32 karakter (`openssl rand -base64 32`) |
| `DEFAULT_ADMIN_USERNAME` | (opsional) override username default |
| `DEFAULT_ADMIN_PASSWORD` | (opsional) override password default |

### 4) Push ke GitHub & connect ke Vercel
1. Push repo ini ke GitHub.
2. Di Vercel → **Add New Project** → import repo ini.
3. Build command default: `next build` (Prisma generate sudah include via script `build` & `postinstall`).
4. Setelah deploy pertama, jalankan migration sekali:
   ```bash
   # dari mesin lokal, dengan DATABASE_URL = production
   DATABASE_URL="postgresql://..." npx prisma db push
   ```
   Atau aktifkan migration via Vercel Build Command: `prisma db push --accept-data-loss && next build` (untuk awal saja).
5. Buka URL Vercel → buka `/admin/login` → masuk dengan `admin / admin123` → segera ganti password.

## Skema Database

```prisma
model AdminUser {
  id, username, passwordHash, name, createdAt, updatedAt
}

model LeaveRequest {
  id, nama, nip, departemen, jenisCuti, tanggalMulai, tanggalSelesai,
  jumlahHari, alasan, status (PENDING/APPROVED/REJECTED), catatanAdmin,
  reviewedAt, reviewedBy, createdAt, updatedAt, attachments[]
}

model LeaveAttachment {
  id, leaveRequestId, fileName, fileType, fileSize,
  storageKind (blob/local), storagePath, uploadedAt
}
```

## Keamanan

- Password admin di-hash dengan **bcrypt** (cost 12).
- Sesi admin: cookie `httpOnly + secure + sameSite=lax`, JWT HS256 ditandatangani dengan `AUTH_SECRET`.
- Endpoint `/admin/*` & `/api/admin/*` dilindungi middleware.
- File bukti hanya dapat diakses oleh admin lewat `/api/admin/attachments/[id]` (cek otorisasi).
- Validasi file di server: tipe (PDF/JPG/PNG) dan ukuran (≤ 5 MB) dicek ulang.

## Skrip

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (otomatis `prisma generate`) |
| `npm run start` | Jalankan build production |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type-check |
| `npm run db:push` | Sinkronisasi schema Prisma → DB |
| `npm run db:studio` | Buka Prisma Studio |
