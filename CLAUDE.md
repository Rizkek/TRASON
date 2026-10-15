# CLAUDE.md

TRASON (Track & Sync OS): personal operating system berbasis PWA. Satu tempat untuk finance, investments, schedule, reminders, sport, career, dan insights. Bahasa produk: English (UI), dokumentasi internal: Indonesia.

## 1. Aturan Kerja

Aturan ini wajib diikuti di setiap sesi.

* **Respons:** Langsung ke inti. Tanpa kalimat pengantar atau penutup.
* **Eksekusi manual:** Jangan menjalankan instalasi paket (npm/bun/yarn) atau operasi Git (commit, push, checkout) kecuali diminta eksplisit. Berikan snippet CLI dengan 1 kalimat deskripsi. Pengecualian: perintah baca-saja seperti `git status`, `git diff`, `tsc --noEmit`.
* **Stop pada error:** Jika perbaikan memicu error beruntun, berhenti. Jelaskan akar masalah dalam 1-2 kalimat dan tunggu instruksi.
* **Rahasia:** Jangan pernah membaca, mencetak, atau menyalin isi `.env*`. Untuk mengetahui variabel yang ada, lihat tabel di bagian 6 atau grep `process.env.` di `src/`. Jangan menulis nilai kunci ke kode, docs, log, atau pesan commit.
* **Kode:** Prinsip fungsional, tanpa duplikasi logika, tanpa over-engineering. Periksa utilitas bawaan bahasa/framework/library terpasang sebelum menulis fungsi baru. Penamaan: camelCase untuk variabel, PascalCase untuk komponen.
* **Komentar:** Hanya untuk menjelaskan kenapa (logika bisnis/algoritma kompleks), bukan apa.

## 2. Stack (versi terpasang)

| Area | Library |
|---|---|
| Framework | Next.js 15.5 (App Router), React 18.3, TypeScript 5.9 strict |
| Styling | Tailwind CSS 3.4, `@tailwindcss/forms`, `@tailwindcss/typography`, `clsx` + `tailwind-merge` (`cn()` di `src/lib/utils.ts`), `class-variance-authority` |
| Ikon | `@phosphor-icons/react` (bukan Lucide; mapping di `src/config/icons.ts`) |
| Chart | `chart.js` 4 + `react-chartjs-2` (bukan Recharts) |
| Data client | `swr` 2 (cache + optimistic update), `zustand` 4 (auth/investment/transaction store) |
| Backend | Supabase: `@supabase/ssr` 0.10 + `@supabase/supabase-js` 2 (Postgres + Auth + Storage, RLS) |
| AI | Vercel AI SDK `ai` 6 + `@ai-sdk/google` 3 (utama), `@ai-sdk/openai` 3 (hanya untuk NaraRouter, saat ini dinonaktifkan) |
| Validasi | `zod` 4 |
| PWA | `@serwist/next` 9 (service worker `src/app/sw.ts` menjadi `public/sw.js`), `web-push` |
| Email | `resend` |
| Lain | `pdfjs-dist` (ekstraksi PDF), `react-day-picker` 10, `@radix-ui/react-select|popover`, `nextjs-toploader`, `@vercel/speed-insights` |
| Test | `jest` 30 + `ts-jest` + `jsdom` + Testing Library |

Package manager: `package-lock.json` dan `bun.lock` sama-sama ada. Default pakai npm kecuali user menyebut bun.

Dokumentasi library: AI SDK menyertakan docs lokal di `node_modules/ai/docs/` (baca ini dulu untuk API `ai`). Library lain: pakai docs resmi sesuai versi di atas. Perhatikan Next 15 (`cookies()`, `headers()`, `params` bersifat async), Zod 4 (API berbeda dari Zod 3), dan AI SDK 6 (`generateObject` sudah deprecated, pengganti `generateText` dengan `output`).

## 3. Perintah

```bash
npm run dev          # next dev (ipv4first, via cross-env)
npm run dev:turbo    # dengan Turbopack
npm run clean        # hapus .next dan cache
npm run build        # next build (TS error memblokir build; ESLint diabaikan saat build)
npm run type-check   # tsc --noEmit
npm run lint         # eslint src --fix (mengubah file)
npm test             # jest; satu file: npx jest path/ke/file.test.ts
```

## 4. Struktur

```
src/
  app/
    (app)/        halaman terautentikasi: dashboard, finance, investments, schedule,
                  reminders, insights, sport, career, settings, onboarding
    (auth)/       login, signup
    (landing)/    halaman publik: about, pricing, vision, roadmap, legal, dll
    api/          route handler (lihat bagian 5)
    sw.ts         source service worker
  components/     ui/ (primitif: Button, Card, Input, Modal), layout/, landing/, modules/Sport/
  hooks/          satu hook SWR per domain (useReminder, useTransaction, ...)
  services/       akses data per domain; satu-satunya tempat memanggil supabase.from()
    supabase/     supabaseClient.ts (browser client + tipe), queryBuilder.ts (withAuthQuery)
    finance/ activity/ career/ workout/ analytics/ insights/ core/
    ai/           provider.ts, parser.ts, receiptExtractor.ts, driverPayoutExtractor.ts
  libs/           utilitas murni: date, format, validation (zod), apiErrors, cacheKeys,
                  mutations, notificationLogic, exchange, i18n/, analytics/ (rule-based), api/
  lib/utils.ts    hanya cn()
  store/          zustand: authStore (persist)
  types/          database.ts = sumber kebenaran tipe tabel (re-export lewat index.ts)
  modules/        registry.ts + types.ts: metadata, setting, dependency, dan toggle modul
  utils/supabase/ server.ts (createClient, getAuthenticatedUser), middleware.ts (updateSession)
  middleware.ts   guard rute; API route dikecualikan dari matcher
  data/ config/ providers/
docs/             dokumentasi produk, API, skema DB (sebagian usang, lihat bagian 8)
```

`src/lib` (satu file) dan `src/libs` berbeda; fungsi baru masuk `src/libs`.

## 5. Pola Arsitektur

**Alur data klien:** komponen -> hook (`src/hooks`) -> `services/*Queries` -> `supabase` browser client -> RLS. Setiap query membungkus `withAuthQuery` (mengambil user lewat `getSession()`, sengaja bukan `getUser()` agar tidak bentrok navigator lock) dan error lewat `logError` + `handleQueryError` (`libs/apiErrors.ts`, memetakan kode Postgres ke `ApiError`).

**Hook dan SWR:** key harus dari `CACHE_KEYS` di `libs/cacheKeys.ts`; konfigurasi dari `config/swr.ts`. Mutasi memakai `executeMutation` (`libs/api/mutationBuilder.ts`) dengan update optimistik, lalu invalidasi lewat `INVALIDATION_PATTERNS`. Setelah mutasi yang memengaruhi dashboard, invalidasi `dashboard:overview`. Pola alternatif terpusat ada di `libs/mutations.ts`. Update optimistik memakai updater biasa `mutate((current) => ..., { revalidate: false })`, bukan `optimisticData` atau mutator async: keduanya menerima data committed dan menghapus perubahan lain yang masih berjalan (contoh benar: `hooks/useDailyTasks.ts`). Revalidasi setelah mutasi lewat `invalidateKeys` (`libs/cacheInvalidation.ts`) dengan pola dari `INVALIDATION_PATTERNS`, bukan `mutate()` lokal ditambah `globalMutate` terpisah (key yang sama ter-fetch dua kali). Satu mutasi cukup satu revalidasi. Data yang gagal dimuat harus ditampilkan dengan `InlineError`, bukan sebagai daftar kosong.

**Halaman:** server component (`page.tsx`) mengambil data awal dengan `createServerClient` dan mengoper ke `*Client.tsx` / `_client.tsx` sebagai props; interaksi dan SWR ada di komponen klien. Halaman yang membaca cookie (contoh `finance`, `career`) memakai `export const dynamic = 'force-dynamic'`; halaman lain hanya merender shell klien. Halaman di `(app)` tidak boleh membungkus diri dengan `<Layout>`: shell persisten ada di `(app)/layout.tsx` (onboarding dikecualikan di dalam `Layout`).

**Auth:** `middleware.ts` memanggil `updateSession` yang me-redirect rute terproteksi ke `/login?redirect_to=...` dan `/login`, `/signup`, `/` ke `/dashboard` bila sudah login. Daftar rute terproteksi hardcoded di `utils/supabase/middleware.ts`; modul baru harus ditambahkan ke sana dan ke `NETWORK_ONLY_ROUTES` di `app/sw.ts`. `AuthProvider` memanggil `useAuth()` sekali sebagai satu-satunya subscription `onAuthStateChange`; komponen lain membaca `useAuthStore`.

**API route (`src/app/api`):** middleware tidak melindungi `/api`, jadi tiap route wajib memverifikasi sendiri dengan `getAuthenticatedUser()` dan mengembalikan 401. Pengecualian: `validate-email` (publik) dan `cron/*` (memakai `CRON_SECRET` dan Supabase service role). Route AI memakai `maxDuration` bila perlu.

| Route | Fungsi |
|---|---|
| `parse` | Smart Input: bahasa natural menjadi transaksi/task |
| `finance/extract-receipt`, `extract-driver-payout`, `upload-receipt` | OCR struk dan payout driver via Gemini vision, validasi deterministik |
| `insights/generate`, `investments/insights` | ringkasan insight |
| `investments/prices` | harga CoinGecko dan Alpha Vantage |
| `analytics/life-score`, `career/autocomplete`, `holidays`, `sport/exercises` | data pendukung |
| `push/subscribe` | dipanggil service worker saat endpoint push berputar (`pushsubscriptionchange`) |
| `cron/reminders`, `cron/timeline`, `cron/digest` | web-push dan email digest, dipanggil cron-job.org |
| `validate-email` | cek MX lewat DNS-over-HTTPS |

**Cron dan push:** cron-job.org memanggil `cron/reminders` (tiap menit) dan `cron/timeline` (tiap 6 jam) dengan header `Authorization: Bearer <CRON_SECRET>`; `authorizeCron` (`libs/cron/auth.ts`) menolak semua panggilan bila `CRON_SECRET` kosong. Pengiriman exactly-once dijamin tabel `reminder_notifications` dan `task_nudges` (klaim dulu dengan upsert `ignoreDuplicates`, baru kirim, lepas klaim bila tidak ada push yang sampai). `libs/cron/push.ts` menonaktifkan subscription hanya pada 404/410 atau 5 kegagalan beruntun. Satu user boleh punya satu subscription aktif per perangkat; jangan menonaktifkan endpoint lain saat menyimpan endpoint baru. Sinkronisasi endpoint klien ada di `libs/pushSync.ts` dan dijalankan sekali oleh `Layout`; izin notifikasi hanya diminta dari aksi user. Skema SQL untuk fitur ini ada di `docs/migrations/`, dijalankan manual di Supabase sebelum deploy.

**AI:** semua lewat `services/ai/provider.ts` (`aiModels.fast|balanced|pro|vision`, nama logis dipetakan ke model Gemini 3.x). `getAIProvider()` sengaja dipaksa `gemini-direct` karena bug NaraRouter. Output terstruktur harus punya skema Zod. Ekstraksi AI hanya mengisi draf; pengguna meninjau sebelum data disimpan, dan validasi matematis dilakukan deterministik (`finance/capture/captureValidator.ts`), bukan oleh LLM.

**Rule-based intelligence:** Life Score, financial health, streak, career analytics, dan daily briefing dihitung deterministik di `libs/analytics`. Filosofi produk (`docs/strategic-vision.md`): AI generatif hanya untuk kasus yang tidak bisa diganti aturan. Jangan memakai LLM untuk hal yang bisa dihitung dengan SQL atau TypeScript.

**Modul:** `ModuleId` = finance, investments, timeline, insights, reminders, sport, career. Modul baru didaftarkan di `modules/registry.ts` dan `modules/types.ts`. Route `/timeline` di-redirect permanen ke `/schedule`. Toggle modul per pengguna tersimpan di preferensi.

**i18n:** `useTranslation()` dengan kamus `en`, `id`, `ja`, `es` di `libs/i18n`; key dot-notation, fallback ke English. Setiap string UI baru ditambahkan ke keempat kamus. Istilah produk mengikuti `docs/product-language.md` (misalnya "Activity", "Application", "Dashboard", "Finance"; hindari "Financial Flow", "Command Center", "Career Architect").

**Tipe:** definisi tabel ada di `types/database.ts`. Soft delete lewat kolom `deleted_at`; query selalu menyertakan `.is('deleted_at', null)`.

**Waktu:** reset harian dan notifikasi bergantung pada timezone pengguna. Gunakan helper di `libs/date.ts`, jangan `toISOString().split('T')` untuk tanggal lokal.

**Tes:** ada di `src/libs/__tests__`, `src/services/__tests__`, dan `src/services/finance/**/__tests__`. Logika baru di `libs/` atau `services/finance` sebaiknya disertai tes.

## 6. Environment Variables

Hanya nama; nilai ada di `.env.local` (di-gitignore, jangan dibaca).

| Variabel | Dipakai di | Sisi |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | semua klien Supabase | publik |
| `SUPABASE_SERVICE_ROLE_KEY` | `cron/*`, `push/send-reminder` | rahasia, hanya server |
| `GOOGLE_GENERATIVE_AI_API_KEY` | `services/ai/provider.ts` | rahasia |
| `AI_PROVIDER`, `NARA_API_KEY` | provider NaraRouter (saat ini tidak aktif) | rahasia |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL` | web-push | publik / rahasia |
| `CRON_SECRET` | `cron/*` | rahasia |
| `RESEND_API_KEY` | `cron/digest` | rahasia |
| `ALPHA_VANTAGE_API_KEY`, `COINGECKO_DEMO_API_KEY` | `investments/prices` | rahasia |
| `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_VERSION`, `NEXT_PUBLIC_API_URL` | konfigurasi umum | publik |

Aturan: variabel tanpa awalan `NEXT_PUBLIC_` tidak boleh disentuh dari kode klien. Service role key hanya di route handler server, dan route yang memakainya harus lebih dulu memverifikasi pemanggil. Variabel baru ditambahkan ke tabel ini (nama saja).

## 7. UI dan Styling

Aturan untuk semua kode UI baru:

* Warna solid dan flat dari token proyek. Dilarang gradient, glow (shadow berwarna, blob blur, drop-shadow), emoji, spinner/animasi loading (termasuk `animate-pulse`), dan pewarnaan teks tanpa alasan fungsional. State loading ditampilkan sebagai teks statis. Aturan ini ditegakkan ESLint (`no-restricted-syntax` di `.eslintrc.json`) untuk `(app)`, `(auth)`, dan `components/` di luar `landing/`.
* Gunakan token Tailwind di `tailwind.config.js`: `primary`, `secondary`, `warm-black`, `soft-cream`, `gray-strong|medium|light|very-light`, `success|danger|warning|info`, `income|expense` (alias success/danger untuk uang), `accent-purple`, `deep-sage`, `insight-taupe`. Token `lp-*` hanya untuk landing page, `ui-*` untuk frame produk di landing. Jangan memakai warna palet mentah seperti `bg-red-500`.
* Kode yang tidak bisa memakai class (opsi Chart.js, inline style) mengambil warna dari `src/config/colors.ts` (`TOKEN_COLORS`, `CATEGORY_PALETTE`, `withAlpha`), bukan hex baru.
* Sebelum memakai class kustom, pastikan class itu benar-benar ada di `tailwind.config.js` atau `globals.css`; class yang tidak terdefinisi tidak memberi error, hanya tidak berefek.
* Ukuran teks lewat token semantik (`text-heading-lg`, `text-body-md`, `text-label-sm`, dst) atau komponen di `components/ui/typography.tsx`. Font: Geist (`font-sans`), Geist Mono, DM Serif Display (`font-brand`, judul), Plus Jakarta Sans (`font-display`).
* Mode tema lewat class `dark` / `light` pada `<html>` (`darkMode: 'class'`), variabel warna di `app/globals.css`.
* Pakai komponen `components/ui` (`Button`, `Card`, `Input`, `Select`, `Badge`, `DatePicker`, `Toast`) dan `components/Modal`, `BottomSheet`, `ConfirmModal`. Jangan menulis elemen tombol mentah bila `Button` cukup.
* Teks bersih: hindari bullet hyphen berlebihan dan kalimat hiperbolis. Ikuti `docs/product-language.md` untuk istilah.
* Mobile-first (PWA, `BottomSheet` dipakai untuk form di layar kecil).

## 8. Dokumentasi: Mana yang Bisa Dipercaya

`docs/product-language.md` dan `docs/strategic-vision.md` masih relevan. Sisanya sebagian usang; kode adalah sumber kebenaran.

| Dokumen | Yang sudah tidak cocok dengan kode |
|---|---|
| `README.md` | Menyebut `OPENAI_API_KEY` (kode memakai Gemini), font Cormorant/Inter (layout memakai Geist/DM Serif/Plus Jakarta), folder `timeline/`, dan link `file:///d:/...` |
| `docs/project-overview.md` | Menyebut Recharts; kenyataannya chart.js. Investment ditulis mockup padahal sudah ada modul penuh |
| `docs/setup-environment.md` | Menyebut Lucide-React dan Recharts; env var yang tercantum tidak lengkap |
| `docs/component-ui-architecture.md` | Menyebut `tailwind.config.ts`, `queries.ts`, `index.css`, dan efek glow/blur tebal |
| `docs/api-database.md` | Mengklaim tidak ada API internal; kenyataannya ada banyak route di `src/app/api` |
| `docs/deployment-maintenance.md` | Merujuk `docs/migrations/` yang tidak ada di repo |
| `docs/DATABASE_SCHEMA.md` | Hanya sebagian tabel; tidak memuat budgets, goals, installments, subscriptions, receipt_metadata, push_subscriptions, workout_*, career_applications, dll. Untuk skema lengkap lihat `src/types/database.ts` |

Bila mengubah perilaku yang tercakup dokumen di atas, perbarui dokumennya sekalian.

## 9. Titik Rawan

* CSP di `next.config.js` hanya mengatur `script-src` dengan `'unsafe-inline'` dan `'unsafe-eval'`.
* Server tidak boleh mem-fetch URL yang dikirim klien. Route receipt hanya menerima path storage milik user (`libs/receiptStorage.ts`), dan `GeminiReceiptExtractor` hanya menerima data URL.
* Reminder baru ditolak bila waktunya sudah lewat. Aturannya ada di `reminderQueries.createReminder` (`ApiError` kode `REMINDER_PAST_DUE`) dan `validateReminder({ rejectPastDue: true })`; form menampilkan `NoticeModal`.
* `useGoal` dan `useInvestmentJournal` masih hook mock berisi data contoh (lihat `docs/ui-audit.md`).
* `getCurrentUser()` membaca sesi lokal tanpa validasi server; keamanan data bergantung penuh pada RLS. Setiap tabel baru wajib punya RLS aktif dan policy `auth.uid() = user_id`.
* `eslint.ignoreDuringBuilds: true`: lint tidak memblokir build, jalankan `npm run lint` sendiri.
