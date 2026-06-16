# Project Overview & Requirements

## 1. Deskripsi Proyek
**TRASON (Track & Sync OS)** adalah sebuah aplikasi *Personal Operating System* berbasis web yang bertindak sebagai pusat kendali kehidupan penggunanya. Tujuan utama aplikasi ini adalah untuk menyatukan pelacakan terhadap beragam aspek penting, mulai dari kesehatan finansial, aktivitas & kebiasaan harian (*vitality/habits*), pengingat (*reminders*), hingga rekam jejak lamaran karier. 

Aplikasi ini menyasar para profesional, mahasiswa tingkat akhir, serta individu produktif yang membutuhkan dashboard privat dan terpusat (*Holistic Tracking*). Desainnya menggunakan filosofi estetik minimalis, mengandalkan konsep visual modern (Glassmorphism, animasi mikro, dan skema warna kontras) yang menjanjikan pengalaman pengguna kelas premium.

## 2. Masalah yang Diselesaikan
Sebelum adanya TRASON, pengguna biasanya menggunakan berbagai aplikasi yang terpisah:
- Satu aplikasi untuk memantau pengeluaran (Finance app).
- Satu aplikasi untuk daftar harian (To-do list app).
- Satu *spreadsheet* untuk memantau status lamaran kerja (Career tracker).
TRASON menyelesaikan fragmentasi ini dengan menyuguhkan pengalaman integrasi tanpa batas di satu tempat.

## 3. Daftar Fitur Utama
1. **Dashboard Utama (Home)**  
   *Overview* holistik dari segala aktivitas harian. Mengambil ikhtisar dari modul finansial, statistik vitalitas, *insights* investasi, dan menampilkan kalender *to-do list*.

2. **Finance Module**  
   - Fitur pencatatan **Pemasukan dan Pengeluaran** per kategori.
   - Analisis otomatis *Multi-Currency* dengan kalkulasi kurs *real-time* berbasis USD (*Base Currency*).
   - Visualisasi tren keuangan grafis menggunakan pustaka `Recharts`.

3. **Timeline & Vitality Module**  
   - **Weekly Log**: Sistem perencanaan kalender mingguan. Mengukur waktu aktivitas (*duration*), status *mood*, kategori rutinitas, dan catatan detailnya.
   - **Daily Checklist**: Rekaman kebiasaan repetitif (*habits*) yang statusnya secara cerdas di-*reset* ulang pada jam 00:00 dini hari berdasarkan *timezone* lokal.

4. **Reminders Module**  
   - Pengingat terpadu berbatas tenggat waktu (*due datetime*).
   - Pembagian tab antara daftar aktif dan riwayat/log.
   - Integrasi _browser notification_ (Push Notifications).

5. **Career Module**  
   - *Board* pelacakan proses pencarian kerja dan tahapan wawancara.
   - Menyediakan tautan cepat untuk lowongan (*Job URL*) yang terorganisir.
   - Penyematan indikator visual berupa *badge* ("Accepted", "Rejected", "In Progress", "Withdrawn") yang menawan.

6. **Investment Module** *(Eksperimental/Mockup)*
   - Fitur analisis risiko profil pengguna dan portofolio aset masa depan.

7. **Settings Module**  
   - **Konfigurasi Lokalitas**: Format zona waktu, kustomisasi bahasa panel (*i18n*: English, Indonesian, Japanese, Spanish), tema (dark/light), dan mata uang.
   - **Modularitas**: Sistem *toggle switch* (ON/OFF) untuk mematikan atau menyalakan modul maupun *tab* secara mendetail (mis. mematikan fitur Daily Checklist bila tidak digunakan).
