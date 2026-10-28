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
    (landing)/    halaman publik: about, pricing, vision, roadmap, changelog, contact (gabungan contact + FAQ;
                  `/support` redirect permanen ke sini), privacy, cookies, terms
    api/          route handler (lihat bagian 5)
    sw.ts         source service worker
  components/     ui/ (primitif: Button, Card, Input, Placeholder, typography), layout/ (shell: Layout, Sidebar, MobileHeader, BottomNav, MoreSheet, ThemeSync), auth/ (AuthShell), landing/ (sections, page/ untuk halaman publik), modules/Sport/
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
  data/ config/ providers/   config/site.ts = satu-satunya sumber email, WhatsApp, lokasi publik
scripts/          generate-brand-assets.mjs: favicon, ikon PWA, badge push, og-image dari public/logo-trason.png
docs/             dokumentasi produk, API, skema DB (sebagian usang, lihat bagian 8)
```

`src/lib` (satu file) dan `src/libs` berbeda; fungsi baru masuk `src/libs`.

## 5. Pola Arsitektur

**Alur data klien:** komponen -> hook (`src/hooks`) -> `services/*Queries` -> `supabase` browser client -> RLS. Setiap query membungkus `withAuthQuery` (mengambil user lewat `getSession()`, sengaja bukan `getUser()` agar tidak bentrok navigator lock) dan error lewat `logError` + `handleQueryError` (`libs/apiErrors.ts`, memetakan kode Postgres ke `ApiError`).

**Hook dan SWR:** key harus dari `CACHE_KEYS` di `libs/cacheKeys.ts`; konfigurasi dari `config/swr.ts`. Mutasi memakai `executeMutation` (`libs/api/mutationBuilder.ts`) dengan update optimistik, lalu invalidasi lewat `INVALIDATION_PATTERNS`. Setelah mutasi yang memengaruhi dashboard, invalidasi `dashboard:overview`. Pola alternatif terpusat ada di `libs/mutations.ts`. Update optimistik memakai updater biasa `mutate((current) => ..., { revalidate: false })`, bukan `optimisticData` atau mutator async: keduanya menerima data committed dan menghapus perubahan lain yang masih berjalan (contoh benar: `hooks/useDailyTasks.ts`). Revalidasi setelah mutasi lewat `invalidateKeys` (`libs/cacheInvalidation.ts`) dengan pola dari `INVALIDATION_PATTERNS`, bukan `mutate()` lokal ditambah `globalMutate` terpisah (key yang sama ter-fetch dua kali). Satu mutasi cukup satu revalidasi. Data yang gagal dimuat harus ditampilkan dengan `InlineError`, bukan sebagai daftar kosong.

**Halaman:** server component (`page.tsx`) mengambil data awal dengan `createServerClient` dan mengoper ke `*Client.tsx` / `_client.tsx` sebagai props; interaksi dan SWR ada di komponen klien. Halaman yang membaca cookie (contoh `finance`, `career`) memakai `export const dynamic = 'force-dynamic'`; halaman lain hanya merender shell klien. Judul halaman `(app)` memakai `AppPageHeader` (`components/layout/AppPageHeader.tsx`), bukan markup header sendiri. Halaman di `(app)` tidak boleh membungkus diri dengan `<Layout>`: shell persisten ada di `(app)/layout.tsx` (onboarding dikecualikan di dalam `Layout`).

**Auth:** `middleware.ts` memanggil `updateSession` yang me-redirect rute terproteksi ke `/login?redirect_to=...` dan `/login`, `/signup`, `/` ke `/dashboard` bila sudah login. Daftar rute terproteksi hardcoded di `utils/supabase/middleware.ts`; modul baru harus ditambahkan ke sana dan ke `NETWORK_ONLY_ROUTES` di `app/sw.ts`. `/forgot-password` diperlakukan seperti `/login`; `/reset-password` sengaja tidak, karena berjalan di atas sesi recovery dari link email. Semua tujuan redirect dari URL (`redirect_to`, `next`) lewat `safeRedirectPath` (`libs/authRedirect.ts`). Error auth Supabase dipetakan ke key `auth.errors.*` lewat `authErrorKey` (`libs/authErrors.ts`); `error.message` mentah tidak ditampilkan. CAPTCHA memakai Cloudflare Turnstile bawaan Supabase (`useCaptcha`, token sekali pakai, reset setelah tiap request). `AuthProvider` memanggil `useAuth()` sekali sebagai satu-satunya subscription `onAuthStateChange`; komponen lain membaca `useAuthStore`. Guard klien tunggal ada di `components/layout/Layout.tsx` dan baru meredirect setelah `isAuthReady` true (pemeriksaan sesi pertama selesai), karena `isAuthenticated` yang dipersist bisa usang. Halaman tidak boleh punya efek `router.push('/login')` sendiri.

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
| `validate-email` | cek MX lewat DNS-over-HTTPS; mengembalikan `{ valid, code? }`, teks diterjemahkan di klien |
| `/auth/confirm` (di luar `api/`) | tujuan link email Supabase (konfirmasi signup, reset password): `verifyOtp` dengan `token_hash` atau `exchangeCodeForSession` dengan `code`, lalu redirect ke `next` |

**Cron dan push:** cron-job.org memanggil `cron/reminders` (tiap menit) dan `cron/timeline` (tiap 6 jam) dengan header `Authorization: Bearer <CRON_SECRET>`; `authorizeCron` (`libs/cron/auth.ts`) menolak semua panggilan bila `CRON_SECRET` kosong. Pengiriman exactly-once dijamin tabel `reminder_notifications` dan `task_nudges` (klaim dulu dengan upsert `ignoreDuplicates`, baru kirim, lepas klaim bila tidak ada push yang sampai). `libs/cron/push.ts` menonaktifkan subscription hanya pada 404/410 atau 5 kegagalan beruntun. Satu user boleh punya satu subscription aktif per perangkat; jangan menonaktifkan endpoint lain saat menyimpan endpoint baru. Sinkronisasi endpoint klien ada di `libs/pushSync.ts` dan dijalankan sekali oleh `Layout`; izin notifikasi hanya diminta dari aksi user. Skema SQL untuk fitur ini ada di `docs/migrations/`, dijalankan manual di Supabase sebelum deploy.

**AI:** semua lewat `services/ai/provider.ts` (`aiModels.fast|balanced|pro|vision`, nama logis dipetakan ke model Gemini 3.x). `getAIProvider()` sengaja dipaksa `gemini-direct` karena bug NaraRouter. Output terstruktur harus punya skema Zod. Ekstraksi AI hanya mengisi draf; pengguna meninjau sebelum data disimpan, dan validasi matematis dilakukan deterministik (`finance/capture/captureValidator.ts`), bukan oleh LLM.

**Rule-based intelligence:** Life Score, financial health, streak, career analytics, dan daily briefing dihitung deterministik di `libs/analytics`. Filosofi produk (`docs/strategic-vision.md`): AI generatif hanya untuk kasus yang tidak bisa diganti aturan. Jangan memakai LLM untuk hal yang bisa dihitung dengan SQL atau TypeScript.

**Modul:** `ModuleId` = finance, investments, timeline, insights, reminders, sport, career. Modul baru didaftarkan di `modules/registry.ts` dan `modules/types.ts`. Route `/timeline` di-redirect permanen ke `/schedule`. Toggle modul per pengguna tersimpan di preferensi.

**i18n:** `useTranslation()` dengan kamus `en`, `id`, `ja`, `es` di `libs/i18n`; key dot-notation, fallback ke English. Setiap string UI baru ditambahkan ke keempat kamus. Istilah produk mengikuti `docs/product-language.md` (misalnya "Activity", "Application", "Dashboard", "Finance", "Sport"; hindari "Financial Flow", "Command Center", "Career Architect", dan "Vitality", label lama modul Sport).

**Tipe:** definisi tabel ada di `types/database.ts`. Soft delete lewat kolom `deleted_at`; query selalu menyertakan `.is('deleted_at', null)`.

**Waktu:** reset harian dan notifikasi bergantung pada timezone pengguna. Gunakan helper, jangan `toISOString().split('T')` untuk tanggal lokal: `formatDateOnly` dan `addBillingCycle` di `libs/date.ts` (tanggal dari objek `Date` lokal, aritmetika siklus tagihan), `getLocalISODate(date, timezone)` di `libs/format.ts`, dan `getProfileToday()` di `libs/profileDate.ts` untuk "hari ini" menurut timezone profil (sama dengan yang dipakai cron). Fungsi di `libs/analytics` tetap murni dan tidak boleh mengimpor store.

**Tes:** ada di `src/libs/__tests__`, `src/services/__tests__`, dan `src/services/finance/**/__tests__`. Logika baru di `libs/` atau `services/finance` sebaiknya disertai tes.

## 6. Environment Variables

Hanya nama; nilai ada di `.env.local` (di-gitignore, jangan dibaca).

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
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `components/auth/Turnstile.tsx` (bot check login, signup, lupa password); kosong berarti widget tidak dirender | publik |
| `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_VERSION`, `NEXT_PUBLIC_API_URL` | konfigurasi umum | publik |

Aturan: variabel tanpa awalan `NEXT_PUBLIC_` tidak boleh disentuh dari kode klien. Service role key hanya di route handler server, dan route yang memakainya harus lebih dulu memverifikasi pemanggil. Variabel baru ditambahkan ke tabel ini (nama saja).

## 7. UI dan Styling

Aturan untuk semua kode UI baru:

* Warna solid dan flat dari token proyek. Dilarang gradient, glow dan shadow (termasuk `shadow-lg|xl|2xl`, shadow berwarna, blob blur, drop-shadow), efek membesar (`scale-105`, `hover:scale-*`), `backdrop-blur-xl|2xl`, emoji, ikon bernuansa AI (`Sparkle`, `Robot`, `MagicWand`), spinner/animasi loading (termasuk `animate-pulse`), dan pewarnaan teks tanpa alasan fungsional. State loading ditampilkan sebagai teks statis. ESLint (`no-restricted-syntax` di `.eslintrc.json`) menegakkan gradient, animasi loading, warna palet mentah, glow, ukuran teks arbitrer, dan `font-serif|display` untuk `(app)`, `(auth)`, dan `components/` di luar `landing/`; landing hanya terkena aturan ukuran teks dan font.
* Warna adalah variabel CSS di `app/globals.css` (dasar gelap, `html.light` menimpa), dipetakan di `tailwind.config.js`. Pakai nama peran: `background`, `surface`, `surface-hover`, `foreground`, `muted-foreground`, `subtle`, `primary`, `secondary`, `on-primary`, `success|danger|warning|info`, `income|expense`, `accent-purple`, `deep-sage`, `insight-taupe`. Nama lama (`warm-black`, `soft-cream`, `gray-*`, `warm-gold`) dan token `lp-*` serta `ui-*` sudah dihapus; jangan dipakai lagi. Landing memakai token yang sama dengan app. Emas punya dua peran: `bg-primary` adalah isian dan teks di atasnya `text-on-primary`; `text-primary`, `border-primary`, `ring-primary` otomatis memakai varian teks yang lebih tua di mode terang. Jangan menulis `text-white`, `text-black`, atau `text-background` di atas isian emas. Jangan memakai warna palet mentah seperti `bg-red-500`, dan jangan `bg-white/*`, `border-black/*`, `text-white` untuk elemen yang harus mengikuti tema; pakai `bg-foreground/5`, `border-foreground/10`, `text-foreground`. Kecuali di atas foto atau scrim `bg-black/*`, teks putih boleh.
* Setiap perubahan nilai token wajib lolos `src/libs/__tests__/themeContrast.test.ts` (WCAG AA 4,5:1 untuk teks, 3:1 untuk ring dan border).
* Kode yang tidak bisa memakai class (opsi Chart.js, inline style) memakai hook `useChartTheme()` (`colors`, `palette`, `chrome`) yang membaca `src/config/colors.ts` untuk tema yang sedang tampil, bukan hex baru. CSS inline boleh memakai `rgb(var(--color-foreground) / 0.1)`.
* Sebelum memakai class kustom, pastikan class itu benar-benar ada di `tailwind.config.js` atau `globals.css`; class yang tidak terdefinisi tidak memberi error, hanya tidak berefek.
* Ukuran teks: skala tunggal tanpa ukuran di bawah 12px. Token semantik (`text-display-2xl|xl|lg|md`, `text-heading-xl|lg|md`, `text-title-lg|md`, `text-body-lg|md|sm`, `text-label-md|sm`) atau `text-xs|sm|base|lg|xl|2xl` bawaan Tailwind (12, 14, 16, 18, 20, 24px); `text-[Npx]` dilarang lint. Komponen `Heading`, `Paragraph`, `Mono` di `components/ui/typography.tsx` memakai skala yang sama. `cn()` (`lib/utils.ts`) mengenal token ukuran; kalau menambah token ukuran baru, tambahkan juga ke daftar `theme.text` di sana, kalau tidak `tailwind-merge` menganggapnya warna teks dan menghapusnya.
* Font: Geist (`font-sans`) untuk semua UI dan judul, Geist Mono (`font-mono`) untuk angka, DM Serif Display (`font-brand`, hanya berat 400) untuk wordmark dan judul landing. Plus Jakarta Sans dan `font-serif` sudah dihapus.
* Mode tema lewat class `dark` / `light` pada `<html>` (`darkMode: 'class'`). Pemilik tunggalnya `components/layout/ThemeSync.tsx`, dengan skrip anti-flash di `<head>` (`NO_FLASH_THEME_SCRIPT` di `libs/theme.ts`). Default adalah `system` (`DEFAULT_THEME_PREFERENCE`): pengunjung dan akun baru mengikuti perangkat, onboarding memilih tema perangkat lebih dulu, dan pilihan yang tersimpan di preferensi menang. Nilai `system` hanya hidup di store lokal; tipe `UserPreferences.theme` hanya `light|dark`, dan belum diverifikasi apakah kolom database menerima nilai lain, jadi jangan menyimpannya sebelum itu dicek. `useResolvedTheme()` memberi tema yang sedang tampil.
* Pakai komponen `components/ui` (`Button`, `Card`, `Input`, `Select`, `Badge`, `DatePicker`, `Toast`) dan `components/Modal`, `BottomSheet`, `ConfirmModal`. Jangan menulis elemen tombol mentah bila `Button` cukup.
* Teks bersih: hindari bullet hyphen berlebihan dan kalimat hiperbolis. Ikuti `docs/product-language.md` untuk istilah.
* Mobile-first (PWA, `BottomSheet` dipakai untuk form di layar kecil). Shell berganti di `lg`, bukan `md`: di bawah 1024px (ponsel dan tablet portrait) tampil `MobileHeader` + `BottomNav` dengan konten selebar layar; `Sidebar` (`w-72`) baru muncul mulai `lg`. Tombol mengambang (FAB) halaman tetap `md:hidden`, dan aksi yang sama ada di header (`hidden md:inline-flex`), jadi tablet memakai tombol header.
* Padding kartu dan sel tabel responsif: `p-5 md:p-8`, `px-4 py-4 md:px-8`; jangan `p-8` atau `px-8 py-8` polos. Tabel lebar menyembunyikan kolom sekunder dengan `hidden sm:table-cell` atau punya tampilan kartu terpisah untuk mobile.
* Toggle on/off memakai `Switch` (`components/ui/Switch.tsx`, `role="switch"`), bukan tombol toggle buatan sendiri.
* Judul tanpa eyebrow: jangan menaruh label kecil uppercase dengan titik emas di atas judul. `SectionHeading` dan `PageHeader` sengaja tidak punya prop `eyebrow`.
* Logo: komponen `Logo` (`public/logo-trason.png`, mark TR). Mark lama (huruf T polos, kompas) sudah dihapus; jangan membuat mark tiruan dengan teks "T". Bila logo berubah, jalankan `node scripts/generate-brand-assets.mjs` lalu commit hasilnya di `public/`.
* Isi landing (Pricing, Roadmap, Changelog, FAQ) hanya menyebut fitur yang benar-benar ada di kode. Tidak ada paket berbayar, sistem pembayaran, atau batas jumlah record; "Planned" di Roadmap tanpa tanggal. Kontak publik dibaca dari `config/site.ts`.

## 8. Dokumentasi: Mana yang Bisa Dipercaya

Dokumen di `docs/` dan `README.md` disinkronkan dengan kode pada 2026-10-16. Kode tetap sumber kebenaran bila ada selisih.

| Dokumen | Status |
|---|---|
| `docs/product-language.md`, `docs/strategic-vision.md` | Relevan |
| `README.md`, `docs/project-overview.md`, `docs/setup-environment.md`, `docs/api-database.md`, `docs/deployment-maintenance.md`, `docs/DATABASE_SCHEMA.md` | Sinkron |
| `docs/API_DOCUMENTATION.md` | Hanya merinci 4 dari 16 route; daftar lengkap ada di `docs/api-database.md` |
| `docs/component-ui-architecture.md` | Sinkron dengan kode saat ini, tetapi akan ditulis ulang setelah perombakan token, tipografi, dan tema |
| `docs/ui-audit.md`, `docs/migrations/` | Catatan kerja dan SQL manual; keduanya di-gitignore (aturan `/docs`) |

Bila mengubah perilaku yang tercakup dokumen di atas, perbarui dokumennya sekalian.

## 9. Titik Rawan

* CSP di `next.config.js` hanya mengatur `script-src` dengan `'unsafe-inline'` dan `'unsafe-eval'`.
* Server tidak boleh mem-fetch URL yang dikirim klien. Route receipt hanya menerima path storage milik user (`libs/receiptStorage.ts`), dan `GeminiReceiptExtractor` hanya menerima data URL.
* Reminder baru ditolak bila waktunya sudah lewat. Aturannya ada di `reminderQueries.createReminder` (`ApiError` kode `REMINDER_PAST_DUE`) dan `validateReminder({ rejectPastDue: true })`; form menampilkan `NoticeModal`.
* `/investments/goals` dan `/investments/journal` hanya me-redirect ke `/investments`. Hook mock dan halamannya dihapus; tipe `Goal`, `InvestmentGoalAllocation`, `InvestmentTransaction` belum punya tabel atau query. Bangun skema dan query nyata sebelum membuat halamannya lagi.
* `getCurrentUser()` membaca sesi lokal tanpa validasi server; keamanan data bergantung penuh pada RLS. Setiap tabel baru wajib punya RLS aktif dan policy `auth.uid() = user_id`.
* `eslint.ignoreDuringBuilds: true`: lint tidak memblokir build, jalankan `npm run lint` sendiri.
* Halaman legal mendaftar fakta dari kode: `PROCESSORS` di `(landing)/privacy/page.tsx` (setiap layanan eksternal dan data yang diterimanya) dan tabel di `(landing)/cookies/page.tsx` (cookie Supabase dan setiap key localStorage). Menambah integrasi, layanan eksternal, atau key `localStorage` berarti memperbarui tabel itu dan tanggal `LAST_UPDATED`.
* Bucket `receipts` private (`docs/migrations/2026-10-28-private-receipts.sql`, policy per folder `<user id>/`). Kode tidak pernah memakai `getPublicUrl` untuk struk: `upload-receipt` mengembalikan path, route server membaca lewat `downloadReceiptAsDataUrl`, dan klien menampilkan gambar lewat `storageQueries.getReceiptSignedUrl` (10 menit). Bucket `avatar` sengaja tetap public.
* Prompt install PWA (`PwaInstallPrompt`) hanya dipasang di `(app)/layout.tsx`. Pesan konsol Chrome "Banner not shown: beforeinstallpromptevent.preventDefault() called" muncul karena prompt bawaan ditahan untuk kartu ini; itu bukan error.
