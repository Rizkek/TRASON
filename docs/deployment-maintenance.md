# Deployment & Maintenance Guide

## 1. Langkah Rilis & Distribusi (Deployment)

Aplikasi TRASON menggunakan tumpukan dasar _Next.js (App Router)_ yang mengandalkan kapabilitas *Server-Side Rendering* (SSR) dengan kombinasi statik. Panduan rilis ini sangat disarankan untuk diarahkan ke Edge Platform bawaan Next.js yakni **Vercel** atau platform yang kompatibel seperti **Netlify**.

### A. Persiapan Kompilasi Lokal (Pre-Flight)
Sebelum sebuah perubahan dipublikasikan atau didorong melalui Git (`git push`), pastikan Anda memverifikasi dua metrik ini di _terminal_:
1. **TypeScript Check**: 
   Verifikasi tidak adanya tipe parameter yang menyimpang di seluruh proyek:
   ```bash
   npx tsc --noEmit
   ```
2. **Uji Coba Pembangunan (Local Build)**:
   Membangun folder keluaran (Output Node) untuk menyadari potensi *error* rendering di sisi server jauh lebih awal.
   ```bash
   npm run build
   ```

### B. Distribusi ke Produksi (Vercel)
1. Pergilah ke antarmuka *Dashboard Provider* Vercel.
2. Tambahkan Proyek (*Add New Project*) dan berikan wewenang pelacakan integrasi GitHub/GitLab ke repositori Anda.
3. Di tab **Environment Variables**, isi dan masukkan nilai konfigurasi API sesuai pedoman di file *Setup Environment*. 
   *(Contoh: `NEXT_PUBLIC_SUPABASE_URL` dan kuncinya, harus disertakan).*
4. Tekan **Deploy**. Vercel akan otomatis menjalankan antrian instalasi paket, mendeteksi *build output*, serta mendistribusikan situs web ke server CDN Edge Network di penjuru dunia.

## 2. Pemeliharaan Basis Data
Karena TRASON berpusat di Supabase, jangan lupa untuk secara berkala menekan (*apply/migrate*) logika file SQL Migration terbaru yang berada di folder `docs/migrations/`. Pembaruan tabel `original_currency`, fungsionalitas kolom log (*history tracking*), dan integrasi perbaruan API dilakukan dengan mengeksekusi skrip SQL dari dashboard antarmuka SQL Supabase secara manual maupun melalui *Supabase CLI*.

## 3. Catatan Rilis Historis (Changelog)

- **v1.0.0 (MVP Phase)**:  
  Perilisan arsitektur fundamental awal. Aplikasi sukses mendemonstrasikan pelacakan 5 pilar besar: (1) Dasbor Terpusat, (2) Pengelompokan *Finance*, (3) Catatan *Timeline* kalender harian, (4) Panel jadwal berulang dalam *Reminders*, serta (5) Jejak lamaran *Career*.

- **v1.1.0 (Logs, SWR Bugfixes & Timezones)**:  
  Fase penambalan kebocoran memori. Sinkronisasi SWR untuk pencatatan ganda pada fitur "centang" diubah agar memanggil kueri *uncomplete*. Perubahan masif pada basis algoritma *Timezone*, membuat siklus tugas (00:00 AM) dapat membedakan acuan waktu wilayah pengguna yang akurat, dengan penambahan skema tabel *tracking logs* riwayat database untuk keperluan analitika mendatang.

- **v1.2.0 (The Premium Aesthetics Update)**:  
  Transformasi fitur fungsional. 
  1. Fitur konfigurasi multi-kurs dalam pengolahan nilai *original currency* dan *base_currency*. (Memanggil kalkulasi SDK dari nilai pasar saat entri _form_ ditekan).
  2. Implementasi tab-Sub-Toggles konfigurasi khusus yang memungkinkan pengguna memilah jenis pilar mana yang mau dirender dari menu *Settings*.
  3. Transformasi minimalisme modul Dasbor yang melahirkan area daftar _checklist_ instan tanpa distraksi antarmuka tabel grafik yang terlalu membebani beranda.
