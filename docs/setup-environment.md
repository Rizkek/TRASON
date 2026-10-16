# Setup & Environment Guide

## 1. Prasyarat

- Node.js 20 atau lebih baru.
- Package manager: npm secara default. `package-lock.json` dan `bun.lock` sama-sama ada; pakai bun hanya bila sengaja, dan jangan biarkan salah satunya usang.
- Akun Supabase (Postgres 15+, Auth, Storage), kunci Google Generative AI, pasangan kunci VAPID, akun Resend, dan kunci Alpha Vantage serta CoinGecko bila fitur harga investasi dipakai.

## 2. Instalasi lokal

```bash
git clone <repository_url_trason>
cd TRASON
npm install
npm run dev
```

Server berjalan di `http://localhost:3000`. Skrip `dev` memakai `--dns-result-order=ipv4first` lewat `cross-env`. `npm run dev:turbo` menjalankan Turbopack, dan `npm run clean` menghapus `.next` serta cache.

Stack terpasang: Next.js 15.5 (App Router), React 18.3, TypeScript 5.9 strict, Tailwind CSS 3.4, ikon Phosphor, chart.js, SWR, Zustand, Supabase, Vercel AI SDK, Serwist. Versi pasti ada di `package.json`.

## 3. Environment variables

Buat `.env.local` di root proyek. File ini di-gitignore. Berikut nama variabel saja; nilai tidak pernah ditulis ke dokumen, kode, log, atau pesan commit.

| Variabel | Dipakai di | Sisi |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | semua klien Supabase | publik |
| `SUPABASE_SERVICE_ROLE_KEY` | `cron/*` | rahasia, hanya server |
| `GOOGLE_GENERATIVE_AI_API_KEY` | `services/ai/provider.ts` | rahasia |
| `AI_PROVIDER`, `NARA_API_KEY` | provider NaraRouter (saat ini tidak aktif) | rahasia |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL` | web-push | publik / rahasia |
| `CRON_SECRET` | `cron/*` | rahasia |
| `RESEND_API_KEY` | `cron/digest` | rahasia |
| `ALPHA_VANTAGE_API_KEY`, `COINGECKO_DEMO_API_KEY` | `investments/prices` | rahasia |
| `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_VERSION`, `NEXT_PUBLIC_API_URL` | konfigurasi umum | publik |

Aturan: variabel tanpa awalan `NEXT_PUBLIC_` tidak boleh disentuh dari kode klien. Service role key hanya dipakai di route handler server, dan route yang memakainya harus lebih dulu memverifikasi pemanggil. Bila menambah variabel, tambahkan namanya ke tabel ini dan ke tabel di `CLAUDE.md`.

`CRON_SECRET` kosong berarti semua panggilan `cron/*` ditolak.

## 4. Skema database

Skema SQL tidak dijalankan otomatis. File di `docs/migrations/` dijalankan manual di Supabase SQL editor sebelum men-deploy kode yang memakainya. Folder `docs/` di-gitignore, jadi simpan salinan di luar mesin ini atau ubah aturan `.gitignore`.

## 5. Perintah harian

```bash
npm run type-check   # tsc --noEmit
npm test             # jest; satu file: npx jest path/ke/file.test.ts
npm run lint         # eslint src --fix (mengubah file)
npm run build        # TypeScript error memblokir build, ESLint tidak
```
