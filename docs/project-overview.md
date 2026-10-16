# Project Overview & Requirements

## 1. Deskripsi proyek

**TRASON (Track & Sync OS)** adalah *personal operating system* berbasis web (PWA) yang menyatukan keuangan, investasi, jadwal, pengingat, olahraga, dan karier di satu tempat. Sasarannya profesional, mahasiswa tingkat akhir, dan individu produktif yang ingin satu dashboard privat, bukan enam aplikasi terpisah.

Bahasa produk adalah English (UI), dengan kamus `en`, `id`, `ja`, `es`. Istilah produk mengikuti `docs/product-language.md`. Arah produk ada di `docs/strategic-vision.md`: AI generatif hanya untuk hal yang tidak bisa diganti aturan; Life Score, financial health, streak, dan briefing harian dihitung deterministik.

## 2. Masalah yang diselesaikan

Pengguna biasanya memakai satu aplikasi untuk pengeluaran, satu untuk daftar harian, satu spreadsheet untuk lamaran kerja, dan satu lagi untuk olahraga. TRASON menyatukan data itu sehingga ringkasan lintas modul (Dashboard, Life Score) bisa dihitung dari sumber yang sama.

## 3. Modul

`ModuleId`: finance, investments, timeline, insights, reminders, sport, career. Setiap modul bisa dinyalakan atau dimatikan per pengguna di Settings; sub-fitur tertentu (misalnya checklist harian, tab Active dan History pada reminders) punya toggle sendiri.

1. **Dashboard**: salam kontekstual, kartu Up Next (reminders), Current State (finance, vitality, career), checklist harian, Life Score, dan analitik keuangan yang bisa dilipat.
2. **Finance**
   - Pemasukan dan pengeluaran per kategori, multi-kurs dengan kurs ke base currency.
   - Budget, subscriptions, installments.
   - Capture dari teks natural (Smart Input), foto struk, dan payout driver. Hasil AI hanya draf; pengguna meninjau dulu, dan validasi matematis dilakukan deterministik.
   - Grafik memakai chart.js.
3. **Investments**: posisi saham, kripto, emas, properti, utang, dan kendaraan dengan harga dari CoinGecko dan Alpha Vantage, snapshot harga, dan ringkasan portofolio. Sub-halaman Goals dan Journal belum ada (diarahkan ke `/investments`) sampai tabelnya dibuat.
4. **Schedule** (`timeline`)
   - Weekly Log: aktivitas per minggu dengan durasi, kategori, dan catatan.
   - Daily Checklist: kebiasaan harian yang di-reset menurut timezone profil.
5. **Reminders**: pengingat dengan waktu jatuh tempo, notifikasi web-push pada beberapa waktu sebelum jatuh tempo, tab Active (judul, waktu, prioritas) dan History (read-only). Reminder dengan waktu lampau ditolak.
6. **Sport**: rencana latihan, sesi, dan personal records.
7. **Career**: pipeline lamaran (Applied, Interview, Accepted, Rejected, Withdrawn), interview journal, dan resume match.
8. **Insights**: ringkasan yang dibuat saat diminta, dengan Life Score dan data aturan sebagai dasar.
9. **Settings**: profil, bahasa, timezone, mata uang, tema, notifikasi, toggle modul, keamanan, dan hapus akun.

## 4. Pembagian logika

| Jenis | Tempat |
|---|---|
| Perhitungan deterministik (Life Score, streak, financial health, career analytics, briefing) | `src/libs/analytics` |
| Akses data | `src/services/*Queries.ts` |
| Orkestrasi UI dan cache | `src/hooks` (SWR) |
| Ekstraksi dan ringkasan AI | `src/services/ai`, route di `src/app/api` |
| Notifikasi terjadwal | `src/app/api/cron/*`, `src/libs/cron` |

Hook dan modul analytics tertentu (`useDailyBriefing`, `useFinancialHealth`, `useStreak`, `useModuleStatus`) sengaja ditunda sampai fiturnya dipakai.
