# Component & UI Architecture

## 1. Struktur Direktori Source Code
Arsitektur source code pada TRASON sangat bergantung pada tata bahasa sistem Next.js (App Router) modern. Berikut adalah skema organisasi direktori yang ada di bawah folder `src/`:

- **`src/app/`**  
  Merupakan fondasi sistem *routing* halaman berbasis antarmuka (*pages*). Terdapat direktori-direktori spesifik modul seperti `/finance`, `/timeline`, `/dashboard`, `/settings`, dan `/reminders`.
- **`src/components/`**  
  Pusat koleksi seluruh desain antarmuka (*UI*) *reusable* global. Memuat komponen makro seperti *Navbar*, *Layout*, hingga *micro-components* (*Button*, *Modal*).
- **`src/hooks/`**  
  Mewadahi semua perantara kueri *Custom React Hooks*. Area ini menangani perpindahan data (fetching) menggunakan **SWR**, yang berperan memitigasi waktu pemuatan data berulang di halaman. (Contoh: `useActivity`, `useUserPreferences`).
- **`src/libs/`**  
  Didedikasikan murni untuk utilitas logika. Area ini berisikan *helper functions* algoritma untuk *formatting* waktu (Date), pengaturan kurs *real-time* (`exchange.ts`), penerjemahan bahasa (*i18n*), dan metode validasi (Zod).
- **`src/services/`**  
  Menjadi *Single-Source of Truth* komunikasi Basis Data. Terdapat inisialisasi API (*client creation*) pada `supabaseClient.ts`, dan abstraksi seluruh permintaan (Requests API) melalui file `queries.ts`.
- **`src/store/`**  
  Wadah konfigurasi State Lintas Global menggunakan Zustand (terutama melacak properti Auth `useAuthStore`).
- **`src/types/`**  
  Mendefinisikan *strict Interfaces* (tipe TypeScript) untuk memastikan seluruh bentuk dan alur pertukaran struktur *Database* dan respons klien tidak mengalami galat kompilasi.

## 2. Aturan Styling (Panduan UI Tailwind)
TRASON dirancang agar memiliki ciri khas "Personal OS" futuristik yang terinspirasi oleh palet hitam metal, pencahayaan pudar emas hangat, serta efek *Glassmorphism*.
Aturan Tailwind yang diterapkan di sini:
- **Konsistensi Palet**: Pemanggilan kelas statis yang di-kustomisasi dalam `tailwind.config.ts`, seperti `bg-warm-black`, `text-soft-cream`, `bg-primary`, `bg-income` (Hijau), atau `bg-expense` (Merah). Hindari pemanggilan variabel mentah seperti `bg-red-500`.
- **Sleek & Minimalis**: Hindari kelas panjang berlebihan jika memungkinkan untuk disatukan dalam `@layer components` pada `index.css`. Penggunaan efek kabur harus konsisten memakai `backdrop-blur-xl` dipadukan dengan dasar `bg-black/[0.02]` (Tingkat Opasitas transparan).
- **Animasi Mikro**: Tumbuhkan interaktivitas menggunakan `transition-all duration-300`, interaksi semacam efek tombol melayang, *glow shadow*, maupun pudar perlahan saat *hover*.

## 3. Library Komponen Reusable
Demi mendukung efisiensi koding (*DRY* - *Don't Repeat Yourself*), komponen makro telah dienkapsulasi pada folder `src/components/`:

- **`<Card />`**:  
  Seluruh kotak informasi finansial atau daftar modul wajib bersarang di dalam elemen Card. Konfigurasi dasarnya otomatis mengatur ketebalan garis batas tipis (`border`), pinggiran melengkung (`rounded-xl`), dan paduan warna *glass*.
- **`<Button />`**:  
  Gunakan hanya komponen dari `<Button>` untuk antarmuka tombol (bukan langsung elemen `<button>` HTML) agar mendapat dukungan bawaan tipe turunan `variant` (primary, secondary, danger, ghost), serta dukungan indikator memuat (`isLoading={true}`).
- **`<Badge />`**:  
  Komponen teks berbentuk sirkuler kecil untuk label keterangan (seperti jenis transaksi, kondisi lamaran), memuat logika pewarnaan status sukses, peringatan, atau infomasi umum.
- **`<Modal />` & `<ConfirmModal />`**:  
  Komponen pembungkus selubung dialog (*Dialog Overlay*). Mengatasi penataan lokasi sumbu *z-index*, warna latar blur tergelapkan, serta fungsionalitas penutupan saat mengklik di luar kanvas formulir yang mengapung.
