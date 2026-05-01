# Testing Aplikasi Cuti

This app is a Next.js 14 leave-request system: a public form (no login) at `/` that creates `LeaveRequest` rows + uploads attachments, and an admin panel at `/admin/*` (default `admin` / `admin123`) for approve/reject and CSV export.

## Setup (one-time per fresh VM)

```bash
# 1) Postgres in Docker
docker run --name cuti-pg -e POSTGRES_PASSWORD=devpw -e POSTGRES_DB=cuti -p 5432:5432 -d postgres:16-alpine

# 2) .env (in repo root)
cat > .env <<'EOF'
DATABASE_URL="postgresql://postgres:devpw@localhost:5432/cuti?schema=public"
AUTH_SECRET="local-dev-auth-secret-do-not-use-in-prod-1234567890"
EOF

# 3) Apply Prisma schema and start dev server
npx prisma db push --skip-generate
npm run dev   # listens on http://localhost:3000
```

The `psql` CLI is NOT installed on Devin VMs. Use `docker exec -e PGPASSWORD=devpw cuti-pg psql -U postgres -d cuti -c "..."` instead.

## Default admin

The first POST to `/api/admin/login` calls `ensureDefaultAdmin()` (`src/lib/auth.ts`), which seeds `admin / admin123` if the `AdminUser` table is empty. No manual seeding step required.

## Browser caveat

Chrome on Devin VMs sometimes refuses to launch (exits immediately with code 7, even with `--no-sandbox`). When that happens, use shell + curl — the dev server hits the same Next.js routes the UI does, so all production code paths are still exercised. If Chrome does work, navigate to `http://localhost:3000/` and `http://localhost:3000/admin/login`.

## Shell-based end-to-end test recipes

### Submit a leave request with attachment

```bash
curl -X POST http://localhost:3000/api/leave \
  -F "nama=Asep Test" -F "nip=EMP-001" -F "departemen=IT" \
  -F "jenisCuti=SAKIT" \
  -F "tanggalMulai=2026-05-04" -F "tanggalSelesai=2026-05-06" \
  -F "alasan=Demam tinggi" \
  -F "attachments=@bukti.pdf"
# expect: 201, {"ok":true,"id":"<cuid>"}
# jenisCuti enum values: TAHUNAN | SAKIT | MELAHIRKAN | PENTING | TANPA_GAJI | LAINNYA
```

Server rejects:
- Files >5 MB → 400 `{"error":"File <name> melebihi 5 MB"}`
- Non-PDF/JPEG/PNG → 400
- `tanggalSelesai < tanggalMulai` → 400
- More than 3 files → 400

### Admin login + protected requests

```bash
curl -c /tmp/cookies.txt -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# expect: 200 {"ok":true} + Set-Cookie: admin_session=<JWT>

curl -b /tmp/cookies.txt http://localhost:3000/admin
# expect: 200, HTML containing "Pengajuan Cuti"

curl --max-redirs 0 -i http://localhost:3000/admin
# expect: 307 → /admin/login?redirect=%2Fadmin   (page routes)
# but for /api/admin/* routes without cookie, expect 401 (not redirect)
```

### Approve a pending request

```bash
curl -b /tmp/cookies.txt -X POST http://localhost:3000/api/admin/leave/<id>/review \
  -H "Content-Type: application/json" \
  -d '{"action":"approve","catatan":"Disetujui"}'
# action: approve | reject | reset
```

DB after approve: `status=APPROVED`, `reviewedBy=admin`, `reviewedAt` set.

### CSV export

```bash
curl -b /tmp/cookies.txt "http://localhost:3000/api/admin/export?bulan=2026-05" -o /tmp/rekap.csv
xxd /tmp/rekap.csv | head -1
# first 3 bytes must be EF BB BF (UTF-8 BOM, so Excel renders correctly)
```

## File storage

- Dev: local disk under `./uploads/YYYY/MM/<uuid>.<ext>` (since `BLOB_READ_WRITE_TOKEN` is unset).
- Prod: Vercel Blob (when `BLOB_READ_WRITE_TOKEN` is set).
- The switch is in `src/lib/storage.ts` (`shouldUseBlob()` reads the env var).

## Devin Secrets Needed

None for local testing — Postgres runs in Docker, file storage falls back to local disk. `AUTH_SECRET` is set inline in `.env` for dev; in production it must be a real random value.

For production-like testing against Vercel Blob you'd need `BLOB_READ_WRITE_TOKEN`.
