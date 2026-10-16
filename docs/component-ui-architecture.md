# Component & UI Architecture

Dokumen ini ringkas dan mengikuti kode saat ini. Aturan UI lengkap ada di `CLAUDE.md` bagian 7. Sistem token, tipografi, dan tema sedang dirombak (lihat `docs/ui-audit.md`); dokumen ini akan ditulis ulang setelah perombakan selesai.

## 1. Struktur `src/`

- `app/(app)/`: halaman terautentikasi. `page.tsx` adalah server component yang mengambil data awal; interaksi dan SWR ada di `*Client.tsx` atau `_client.tsx`. Halaman tidak boleh membungkus diri dengan `<Layout>`; shell persisten ada di `(app)/layout.tsx`, dan onboarding dikecualikan di dalam `Layout`.
- `app/(auth)/`, `app/(landing)/`, `app/api/`: login dan signup, halaman publik, route handler.
- `components/ui/`: primitif (`Button`, `Card`, `Input`, `Select`, `Badge`, `DatePicker`, `Toast`, `Placeholder`, tipografi). `components/` juga memuat `Modal`, `BottomSheet`, `ConfirmModal`, `NoticeModal`, `InlineError`.
- `components/layout/`: shell aplikasi. `Layout` hanya menyusun `Sidebar` (desktop), `MobileHeader`, `BottomNav`, `MoreSheet` (ponsel), `OfflineBanner`, `PushSubscriptionSync`, dan `ThemeSync`; daftar navigasi dari `useNavItems`.
- `components/auth/`: `AuthShell` dan `PasswordToggle`, dipakai halaman login dan signup.
- `components/landing/` dan `components/modules/`: komponen landing dan komponen khusus modul. Halaman publik non-home memakai `landing/page/` (`PageShell`, `PageHeader`, `Prose`); landing memakai token yang sama dengan app dan mengikuti tema.
- `hooks/`: satu hook SWR per domain. Key dari `libs/cacheKeys.ts`, konfigurasi dari `config/swr.ts`.
- `services/`: satu-satunya tempat memanggil `supabase.from()`, dibungkus `withAuthQuery`.
- `libs/`: utilitas murni (date, format, validation, i18n, analytics, cron). Fungsi baru masuk `libs`, bukan `lib/utils.ts` (hanya `cn()`).
- `store/`: Zustand (`authStore`, persisten kecuali `isLoading` dan `isAuthReady`).
- `types/database.ts`: sumber kebenaran tipe tabel.
- `config/`: `colors.ts` (cermin hex token untuk Chart.js dan inline style), `icons.ts` (pemetaan Phosphor), `swr.ts`.

## 2. Aturan styling

- Warna solid dan flat dari token proyek. Dilarang gradient, glow dan shadow, efek membesar saat hover, blur tebal, emoji, ikon bernuansa AI, spinner dan animasi loading (termasuk `animate-pulse`). Loading ditampilkan sebagai teks statis. ESLint (`no-restricted-syntax`) menegakkan sebagian besar di `(app)`, `(auth)`, dan `components/` di luar `landing/`.
- Token warna berupa variabel CSS di `app/globals.css` (dasar gelap, `html.light` menimpa) yang dipetakan di `tailwind.config.js` berdasarkan peran: `background`, `surface`, `foreground`, `muted-foreground`, `primary`, `secondary`, `on-primary`, `success|danger|warning|info`, `income|expense`, `accent-purple`, `deep-sage`, `insight-taupe`. Nama lama (`warm-black`, `soft-cream`, `gray-strong`, `gray-light`) adalah alias peran yang sama. `lp-*` hanya untuk landing, `ui-*` untuk frame produk di landing. Jangan memakai warna palet mentah seperti `bg-red-500`.
- Emas punya dua peran: `bg-primary` isian (teks di atasnya `text-on-primary`), `text-primary` dan `border-primary` varian teks yang lebih tua di mode terang. Kontras diuji di `libs/__tests__/themeContrast.test.ts`.
- Kode yang tidak bisa memakai class memakai `useChartTheme()` (`hooks/useChartTheme.ts`), yang membaca `config/colors.ts` untuk tema yang sedang tampil.
- Pastikan class kustom benar-benar ada di `tailwind.config.js` atau `globals.css`; class yang tidak terdefinisi tidak memberi error, hanya tidak berefek.
- Ukuran teks: satu skala tanpa ukuran di bawah 12px, lewat token semantik (`text-heading-lg`, `text-body-md`, `text-label-sm`, ...), `text-xs|sm|base|lg|xl|2xl`, atau `components/ui/typography.tsx`. `text-[Npx]` dilarang lint. Font: Geist untuk UI, Geist Mono untuk angka, DM Serif Display (`font-brand`) hanya untuk wordmark dan judul landing.
- Tema lewat class `dark` / `light` pada `<html>` (`darkMode: 'class'`), dimiliki `ThemeSync` dengan skrip anti-flash di `<head>`. Default `system` (ikut perangkat). Shell, dashboard, onboarding, auth, landing, dan komponen bersama sudah mengikuti tema; halaman modul sudah memakai token tetapi belum ditinjau satu per satu di layar kecil.
- Mobile-first. `BottomSheet` dipakai untuk form di layar kecil. Kontrol input 16px di bawah 768px agar iOS tidak zoom saat fokus.

## 3. Komponen yang dipakai bersama

- **`Card`**: wadah informasi; memakai class `.card` dari `globals.css`.
- **`Button`**: pakai ini, bukan `<button>` mentah. Variant `primary`, `secondary`, `outline`, `ghost`, `danger`; ukuran `sm|md|lg`; `isLoading` menampilkan teks `loadingText`.
- **`Badge`**: label status.
- **`Modal`, `ConfirmModal`, `NoticeModal`, `BottomSheet`**: dialog. `NoticeModal` dipakai untuk penolakan seperti reminder yang waktunya sudah lewat.
- **`InlineError`**: kegagalan memuat data, persisten dan dengan tombol coba lagi. Data yang gagal dimuat tidak boleh tampil sebagai daftar kosong.
- **`Heading`, `Paragraph`, `Mono`** (`components/ui/typography.tsx`): wrapper tipografi.

## 4. Pola data di komponen

Komponen memanggil hook; hook memanggil `services/*Queries`. Mutasi memakai `executeMutation` dengan update optimistik berupa updater biasa `mutate((current) => ..., { revalidate: false })`, lalu satu kali revalidasi lewat `invalidateKeys` dengan pola dari `INVALIDATION_PATTERNS`. Contoh yang benar: `hooks/useDailyTasks.ts`.

## 5. Guard auth

`middleware.ts` meredirect rute terproteksi di server. Di klien, satu guard ada di `components/layout/Layout.tsx` dan baru bertindak setelah `isAuthReady` bernilai true (pemeriksaan sesi pertama selesai), karena `isAuthenticated` yang dipersist bisa usang. Halaman tidak punya efek redirect sendiri.
