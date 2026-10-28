# Deployment & Maintenance Guide

## 1. Sebelum rilis

Jalankan dari terminal sebelum mendorong perubahan:

```bash
npm run type-check
npm test
npm run build
```

`next build` tidak menjalankan ESLint (`eslint.ignoreDuringBuilds: true`), jadi jalankan `npm run lint` sendiri dan periksa hasilnya.

Bila `public/logo-trason.png` berubah, jalankan `node scripts/generate-brand-assets.mjs` dan commit semua PNG yang dihasilkan di `public/`. Ikon PWA di-cache perangkat; pengguna yang sudah meng-install mungkin perlu menghapus dan memasang ulang untuk melihat ikon baru.

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
| `2026-10-28-private-receipts.sql` | bucket `receipts` jadi private, policy select/insert/update/delete per folder pemilik | deploy perubahan signed URL struk |

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
- **Auth (2026-10)**: lupa dan reset password, route `/auth/confirm` untuk link email di perangkat mana pun, Turnstile lewat CAPTCHA bawaan Supabase, pemetaan error auth ke i18n, `safeRedirectPath` menutup open redirect. Butuh pengaturan dashboard Supabase di `docs/setup-environment.md` sebelum deploy.
- **UI app (2026-10)**: `AppPageHeader` untuk semua halaman `(app)` selain Dashboard, `Button` memakai `cn()` dan jarak ikon `gap-2`, Insights dan Career dirapikan, `careerAnalytics` tidak lagi menghitung lamaran yang ditarik sebagai respons.
- **Brand dan landing (2026-10)**: semua ikon dari mark TR (`scripts/generate-brand-assets.mjs`), manifest dengan ikon maskable dan badge monokrom, Support digabung ke Contact (`/support` redirect permanen), About, Roadmap, Changelog dan Pricing ditulis ulang sesuai fitur yang ada, eyebrow dihapus, sitemap dan robots hanya berisi halaman nyata.
- **Legal dan responsif (2026-10)**: Privacy, Cookies, dan Terms ditulis ulang dari perilaku kode (daftar pemroses, inventaris cookie dan localStorage, UU PDP); prompt install PWA dipindah ke shell app; shell berganti di `lg` agar tablet memakai layout mobile; `Switch` untuk toggle Settings; padding kartu dan tabel responsif; kolom sekunder tabel Investments disembunyikan di ponsel.
- **Struk private dan label Sport (2026-10)**: bucket `receipts` private dengan signed URL dan foto struk tampil di lembar review; Privacy menyatakan Gemini dipakai tanpa billing berbayar; "Sport" menggantikan "Vitality" sebagai label modul.
