# Setup & Environment Guide

## 1. Prasyarat Sistem (Tech Stack)
Sebelum melakukan proses instalasi dan pengembangan aplikasi TRASON, pastikan sistem operasi komputer Anda sudah memenuhi prasyarat *stack* modern berikut:
- **Runtime Environment**: Node.js versi `18.x.x` (Disarankan menggunakan LTS versi `20.x.x` ke atas).
- **Package Manager**: Standar menggunakan `npm` (atau alternatif seperti `bun` dan `yarn` sesuai preferensi).
- **Frontend Framework**: Next.js (App Router API) dengan React versi 19 (atau 18 bergantung *package.json* terkait).
- **Styling**: Tailwind CSS versi `3.x` untuk kompilasi utilitas CSS.
- **Backend/Database**: Supabase (PostgreSQL 15+ dan layanan SDK Auth).

## 2. Panduan Instalasi Lokal

Langkah demi langkah ini memastikan proyek bisa berjalan sepenuhnya di tahap _development_ (menggunakan Antigravity IDE atau editor lainnya).

**Langkah 1: Kloning *Repository***  
Gunakan command-line / terminal Anda untuk mengambil rilis terakhir TRASON:
```bash
git clone <repository_url_trason>
cd TRASON
```

**Langkah 2: Instalasi Dependensi**  
Lakukan instalasi paket eksternal (termasuk *library* Lucide-React, Recharts, Zustand, SWR, dan Supabase JS):
```bash
npm install
```
*(Atau `bun install` / `yarn install` jika Anda menggunakan *package manager* yang berbeda).*

**Langkah 3: Menjalankan Local Server**  
Jika seluruh instalasi sukses dan tidak ada masalah *dependency tree*, eksekusi server pengembangan:
```bash
npm run dev
```
Perintah ini otomatis membangun aset halaman dan berjalan secara bawaan di port 3000. Anda bisa membuka *browser* melalui URL: `http://localhost:3000`

## 3. Environment Variables (.env)
Aplikasi TRASON mengandalkan ekosistem Supabase untuk autentikasi dan integrasi *database*. Oleh karena itu, aplikasi mewajibkan keberadaan variabel *environment*. Buatlah file dengan nama `.env.local` pada folder struktur utama proyek.

Berikut adalah daftar variabel yang perlu dikonfigurasi (Hanya **Nama Variabel**, *jangan sertakan value/kata sandi/kunci privat Anda jika hendak menyalinnya ke repositori publik*):

```env
# Koneksi Basis Data dan Autentikasi Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# (Opsional) Jika sewaktu-waktu ada endpoint khusus:
NEXT_PUBLIC_API_BASE_URL=
```
