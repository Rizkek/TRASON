# TRASON — Strategic Vision & Product Positioning

## Repositioning: Personal Decision Intelligence System

TRASON bukan sekadar "aplikasi all-in-one". TRASON adalah **Personal Analytics System** yang menghubungkan seluruh data kehidupan pengguna dan mengubahnya menjadi keputusan yang *actionable* — tanpa ketergantungan pada AI generatif yang mahal.

---

## Filosofi: Rule-Based Intelligence, Bukan AI-First

Keputusan arsitektur terpenting TRASON adalah memisahkan dengan tegas dua jenis "kecerdasan":

### 1. Rule-Based Intelligence (Core — Gratis)
Analitik deterministik berbasis SQL dan TypeScript yang mengolah data user menjadi insight bermakna. Cepat (<100ms), konsisten, tidak ada biaya per-request.

Contoh:
- "Saving rate Anda bulan ini hanya 5%. Target minimal 20%." — *satu SQL query*
- "Sudah 14 hari tidak ada lamaran baru. Saatnya aktif kembali." — *date diff calculation*
- "Pengeluaran delivery naik 42% dibanding bulan lalu." — *GROUP BY + comparison*

### 2. Generative AI (Premium — Opsional)
Hanya untuk 3 use case yang **tidak bisa** digantikan rules:
- **Smart Input** (`/api/parse`): Parsing bahasa natural ke transaksi/task.
- **Weekly AI Reflection** (user-triggered, sekali seminggu).
- **Resume Analyzer** (future, user-triggered).

---

## Core Intelligence Features (Zero Cost)

### Life Score System
Skor komposit 0–100 yang menggabungkan 4 dimensi kehidupan:

| Dimensi | Bobot | Cara Hitung |
|---|---|---|
| Finance | 30% | Saving rate, cash flow, budget compliance |
| Productivity | 25% | Daily task completion rate, streak |
| Health | 25% | Sport frequency, habit completion |
| Career | 20% | Application activity, response rate |

Life Score ditampilkan di Dashboard sebagai angka utama, dengan delta harian (+2/-3).

---

### Daily Briefing
Ditampilkan pertama kali user membuka aplikasi setiap hari. Konten:
- Life Score + perubahan dari kemarin
- Jumlah task hari ini (selesai/total)
- Reminder yang jatuh tempo 24 jam ke depan
- Satu insight keuangan (pengeluaran kemarin vs. rata-rata)
- Status karier (hari terakhir ada aktivitas lamaran)

**Tidak memerlukan AI. Semua dari aggregasi SQL.**

---

### Financial Health Score + Leak Detection

**Health Score** dihitung dari rules berbasis data:
- Saving rate ≥ 20% → +30 poin
- Pengeluaran < 80% pendapatan → +25 poin
- Tidak ada bulan defisit → +15 poin
- Tidak ada satu kategori yang dominasi >50% → +10 poin

**Subscription Detection**: Mendeteksi transaksi yang muncul setiap bulan dengan judul serupa (Netflix, Spotify, hosting, dll.).

**Leak Detection**: Membandingkan pengeluaran per kategori bulan ini vs. bulan lalu, dan memperingatkan jika ada lonjakan >20%.

---

### Career Analytics
Dihitung langsung dari tabel `career_applications`:
- **Response Rate**: % lamaran yang mendapat respons
- **Interview Rate**: % lamaran yang sampai tahap wawancara
- **Offer Rate**: % yang mendapat penawaran
- **Avg. Days to Interview**: Rata-rata waktu dari apply ke interview
- **Days Since Last Activity**: Alarm jika sudah terlalu lama tidak aktif

---

### Streak System
Dihitung dari `daily_task_logs`. Hari dianggap "berhasil" jika ≥80% task harian diselesaikan. Streak counter ditampilkan di Daily Checklist header.

---

### Weekly Review (Auto-Generated)
Dihasilkan otomatis setiap Minggu. Konten:
- Ringkasan keuangan minggu ini vs. minggu lalu
- Completion rate daily tasks
- Aktivitas karier (lamaran baru, update status)
- Sesi olahraga (vs. target)

Data disimpan di tabel `weekly_reviews` untuk riwayat.

---

### Achievement / Badge System
Milestone rewards yang mendorong engagement:
- *Pencatat Pertama* — transaksi pertama
- *Konsisten 7 Hari* — streak 7 hari
- *Iron Discipline* — streak 30 hari
- *Saver Handal* — saving rate ≥ 30%
- *Job Hunter* — 10+ lamaran
- *Life in Balance* — Life Score ≥ 80

---

### Goal Tracking
Pengguna bisa menetapkan target spesifik dengan deadline:
- "Tabung Rp 10 juta dalam 6 bulan"
- "Olahraga 3x per minggu selama 1 bulan"
- "Kirim 5 lamaran per minggu"

Progress dihitung otomatis dari data yang masuk ke modul terkait.

---

## Fitur yang Ditunda (Butuh Budget/Infrastruktur Lebih)

| Fitur | Alasan Ditunda |
|---|---|
| Resume Analyzer | Memerlukan LLM, tidak bisa dengan rules |
| Personal Knowledge Graph | Overkill untuk tahap ini |
| Life Forecasting | Butuh 6+ bulan data historis per user |
| AI Coach | Butuh LLM dengan context panjang |

---

## Skema DB Tambahan

6 tabel baru yang diperlukan untuk mengaktifkan semua fitur di atas:

```sql
public.life_scores         -- Penyimpanan Life Score harian
public.user_goals          -- Goal tracking dengan progress
public.achievements        -- Badge yang sudah diperoleh user
public.weekly_reviews      -- Cache hasil weekly review
public.notifications_history  -- Riwayat notifikasi
public.budgets             -- Anggaran per kategori per periode
```

3 kolom tambahan di tabel existing:
```sql
reminders.recurrence       -- 'daily', 'weekly', 'monthly'
reminders.recurrence_days  -- [1,3,5] = Senin,Rabu,Jumat
transactions.is_subscription -- Flag transaksi berulang
```

---

## Kesimpulan

> *"Anda tidak perlu AI untuk memberi tahu pengguna bahwa saving rate mereka 5%. Anda hanya perlu satu query dan satu angka. Tapi dampaknya bisa mengubah perilaku finansial seseorang selamanya."*

TRASON yang kuat bukan TRASON yang pakai paling banyak AI — melainkan TRASON yang paling **jelas membantu pengguna memahami hidupnya** dan mengambil keputusan yang lebih baik, hari demi hari.
