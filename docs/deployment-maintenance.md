# Deployment & Maintenance Guide

## 1. Sebelum rilis

Jalankan dari terminal sebelum mendorong perubahan:

```bash
npm run type-check
npm test
npm run build
```

`next build` tidak menjalankan ESLint (`eslint.ignoreDuringBuilds: true`), jadi jalankan `npm run lint` sendiri dan periksa hasilnya.

## 2. Deploy ke Vercel

1. Tambah proyek di Vercel dan hubungkan repositori.
2. Isi seluruh environment variable di tab **Environment Variables**. Daftar lengkap ada di `docs/setup-environment.md`; jangan hanya mengisi variabel Supabase, karena AI, push, cron, email digest, dan harga investasi masing-masing butuh kuncinya.
3. Jalankan migrasi SQL yang belum diterapkan (bagian 3) sebelum deploy kode yang bergantung padanya.
4. Deploy. `public/sw.js` dibuat oleh Serwist saat build dari `src/app/sw.ts`; file itu tidak di-commit.

## 3. Migrasi database

File SQL ada di `docs/migrations/` dan dijalankan manual di Supabase SQL editor. Setiap file ditulis agar aman dijalankan berulang.

| File | Isi | Wajib sebelum |
|---|---|---|
| `2026-10-15-push-reliability.sql` | kolom kesehatan di `push_subscriptions`, tabel `reminder_notifications`, `task_nudges`, `cron_runs` | deploy perubahan cron dan push |

Setiap tabel baru wajib punya RLS aktif. Tabel yang hanya dipakai server (service role) boleh RLS aktif tanpa policy; tabel yang diakses klien butuh policy `auth.uid() = user_id`.

## 4. Cron

cron-job.org memanggil route berikut dengan header `Authorization: Bearer <CRON_SECRET>`:

| Route | Jadwal |
|---|---|
| `/api/cron/reminders` | tiap menit |
| `/api/cron/timeline` | tiap 6 jam |
| `/api/cron/digest` | sesuai kebutuhan email digest |

Pengiriman exactly-once dijamin tabel `reminder_notifications` dan `task_nudges`. Ringkasan run yang punya pekerjaan dicatat di `cron_runs`; run kosong tidak dicatat.

Validasi setelah deploy: buat reminder yang jatuh tempo sekitar 62 menit lagi, lalu periksa `reminder_notifications`, `cron_runs`, dan `push_subscriptions.last_success_at`.

## 5. Catatan perubahan

- **v1.0.0**: dashboard, finance, timeline, reminders, career.
- **v1.1.0**: perbaikan SWR pada checklist harian, siklus reset harian berdasarkan timezone pengguna, tabel log riwayat.
- **v1.2.0**: multi-kurs pada transaksi, toggle sub-fitur per modul di Settings, dashboard yang lebih ringkas.
- **Keandalan push dan reminder**: pengiriman cron exactly-once, setiap perangkat tetap berlangganan, reminder dengan waktu lampau ditolak, shell aplikasi persisten, `InlineError` untuk data yang gagal dimuat, invalidasi cache terpusat (`libs/cacheInvalidation.ts`).
- **Tanggal dan timezone**: tanggal lokal selalu lewat helper `libs/date.ts` dan `libs/profileDate.ts`, "hari ini" mengikuti timezone profil, dan satu guard auth di `Layout`.
- **Investments**: halaman Goals dan Journal disembunyikan (redirect ke `/investments`) sampai ada tabel dan query yang nyata.
