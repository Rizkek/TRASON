# Project Overview & Requirements

## 1. Deskripsi proyek

**TRASON (Track & Sync OS)** adalah *personal operating system* berbasis web (PWA) yang menyatukan keuangan, investasi, jadwal, pengingat, olahraga, dan karier di satu tempat. Sasarannya profesional, mahasiswa tingkat akhir, dan individu produktif yang ingin satu dashboard privat, bukan enam aplikasi terpisah.

Bahasa produk adalah English (UI), dengan kamus `en`, `id`, `ja`, `es`. Istilah produk mengikuti `docs/product-language.md`. Arah produk ada di `docs/strategic-vision.md`: AI generatif hanya untuk hal yang tidak bisa diganti aturan; Life Score, financial health, streak, dan briefing harian dihitung deterministik.

## 2. Masalah yang diselesaikan

Pengguna biasanya memakai satu aplikasi untuk pengeluaran, satu untuk daftar harian, satu spreadsheet untuk lamaran kerja, dan satu lagi untuk olahraga. TRASON menyatukan data itu sehingga ringkasan lintas modul (Dashboard, Life Score) bisa dihitung dari sumber yang sama.

## 3. Modul

`ModuleId`: finance, investments, timeline, insights, reminders, sport, career. Setiap modul bisa dinyalakan atau dimatikan per pengguna di Settings; sub-fitur tertentu (misalnya checklist harian, tab Active dan History pada reminders) punya toggle sendiri.

1. **Dashboard**: salam kontekstual, kartu Up Next (reminders), checklist harian, Current State (finance, sport, career), dan Life Score. Smart Input dibuka dari tombol Quick add di shell atau Ctrl/Cmd+K.
2. **Finance**
   - Pemasukan dan pengeluaran per kategori, multi-kurs dengan kurs ke base currency. Kolom nominal menerima sen untuk mata uang yang punya sen (USD, EUR), dan hanya angka bulat untuk IDR, JPY, dan sejenisnya (`sanitizeAmountInput`, `roundToCurrency` di `libs/format.ts`).
   - Budget, subscriptions, installments.
   - Capture dari teks natural (Smart Input), foto struk, dan payout driver. Hasil AI hanya draf; pengguna meninjau dulu, dan validasi matematis dilakukan deterministik.
3. **Investments**: posisi saham, kripto, emas, properti, utang, dan kendaraan dengan harga dari CoinGecko dan Alpha Vantage, snapshot harga, dan ringkasan portofolio. Sub-halaman Goals dan Journal belum ada (diarahkan ke `/investments`) sampai tabelnya dibuat.
4. **Schedule** (`timeline`)
   - Weekly Log: aktivitas per minggu dengan durasi, kategori, dan catatan; bisa berpindah ke minggu lain. Kolom `mood`, `rating`, dan `location` di tabel `activities` tidak lagi diisi dari form, tetapi datanya tetap ada.
   - Daily Checklist: kebiasaan harian yang di-reset menurut timezone profil.
5. **Reminders**: pengingat dengan waktu jatuh tempo, notifikasi web-push pada beberapa waktu sebelum jatuh tempo, tab Active (judul, waktu, prioritas) dan History (status Selesai atau Terlewat). Reminder bisa ditandai selesai dan dibatalkan lagi dari History. Reminder di History hanya tampil di tab itu: kalender, panel tanggal, Up Next, dan Schedule hanya memuat reminder aktif (`isReminderActive` di `libs/notificationLogic.ts`). Reminder dengan waktu lampau ditolak.
6. **Sport**: rencana latihan dengan hari latihan dan gerakan per hari (target set, repetisi, beban, jarak, atau durasi), sesi, dan personal records. Sesi bisa dicatat langsung dari satu hari di rencana, sehingga tersimpan dengan `workout_plan_id` dan `workout_day_id`.
7. **Career**: pipeline lamaran (Applied, Interview, Accepted, Rejected, Withdrawn), interview journal, dan resume match. Resume match dihitung deterministik di `libs/analytics/atsMatcher.ts`: istilah yang diulang di lowongan berbobot lebih (maksimal 3 kali), istilah teknis berbobot dua kali, link diabaikan, dan hasil diurutkan dari yang terpenting. File lowongan atau CV bisa diunggah atau diseret ke kolomnya. Tombol "Check match" di kartu lamaran membuka Resume match dengan lamaran itu terpilih, dan skornya bisa disimpan ke lamaran (`ats_score`, `ats_checked_at`; SQL di `docs/migrations/2026-11-05-ats-score-and-amount-type.sql`, dijalankan manual sebelum deploy).
8. **Insights**: ringkasan yang dibuat saat diminta, dengan Life Score dan data aturan sebagai dasar.
9. **Settings**: profil, bahasa, timezone, mata uang, tema, notifikasi, toggle modul, keamanan, dan hapus akun.

## 4. Pembagian logika

| Jenis | Tempat |
|---|---|
| Perhitungan deterministik (Life Score, career analytics) | `src/libs/analytics` |
| Akses data | `src/services/*Queries.ts` |
| Orkestrasi UI dan cache | `src/hooks` (SWR) |
| Ekstraksi dan ringkasan AI | `src/services/ai`, route di `src/app/api` |
| Notifikasi terjadwal | `src/app/api/cron/*`, `src/libs/cron` |
