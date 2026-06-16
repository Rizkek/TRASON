# API & Database Documentation

## 1. Arsitektur Komunikasi Data
Mengingat TRASON mengadopsi model **Backend-as-a-Service (BaaS)** berbasis **Supabase**, aplikasi ini bekerja menggunakan arsitektur *Serverless*. Karena hal ini, kami tidak membuat API _endpoints_ REST buatan internal (seperti `api/users` pada Express.js) di dalam _repository_ proyek ini.  
Segala komunikasi pengolahan data dikelola dari sisi klien (Client-Side SDK) yang dipanggil secara langsung menggunakan `supabase.from()`.

## 2. Daftar Skema Entitas Data (Tables)

Tabel berikut ini beroperasi di dalam skema PostgreSQL Supabase:

- **`users` (Tabel Publik)** / **`user_preferences`**:  
  Menyimpan detail konfigurasi akun.
  - Atribut Penting: `theme`, `language`, `currency`, `timezone`, dan tipe JSONB `module_features` (untuk menyimpan konfigurasi sub-toggles tab).
- **`transactions`**:  
  Pusat riwayat pengeluaran (expense) dan pemasukan (income).
  - Atribut Penting: Menyimpan data mata uang murni (`original_amount`, `original_currency`) beserta `exchange_rate_to_base` untuk konversi.
- **`activities` & `daily_tasks`**:  
  Rekaman daftar kegiataan untuk Timeline Module. Di mana, `daily_tasks` akan merekam iterasi harian dari `task` yang sama, sementara riwayat selesai akan dimuat pada tabel `daily_task_logs`.
- **`reminders`**:  
  Menyimpan tugas berdasarkan waktu tenggat spesifik (`due_datetime`) yang menunjang integrasi notifikasi (beserta tabel `reminder_logs`).
- **`career_applications`**:  
  Melacak pelacakan URL pekerjaan, penamaan perusahaan, dan tahapan pelamaran (*Applied*, *Interview*, *Accepted*, *Rejected*).
- **`categories`**:  
  Grup warna dan referensi ikon *interface* finansial (dihubungkan dengan tabel `transactions` menggunakan *Foreign Key*).

## 3. Contoh Payload Method SDK

Sebagai ganti dari spesifikasi REST API Endpoint, berikut adalah contoh operasi SDK Supabase yang mengeksekusi operasi (setara dengan POST Request).

**Contoh: Penambahan Data (Create Transaction)**
- **Method**: `.insert()`
- **Tabel Tujuan**: `transactions`
- **Format Payload Objek (JSON)**:
  ```javascript
  const payload = {
    "user_id": "8d3e23f1-dabc...", // Ditangkap otomatis oleh Auth.uid()
    "title": "Gaji Bulanan",
    "amount": 5000000,
    "type": "income",
    "category_id": "a92e10f1-xxxx...",
    "date": "2026-06-16",
    "original_currency": "IDR",
    "exchange_rate_to_base": 0.000062
  }
  
  const { data, error } = await supabase.from('transactions').insert([payload]);
  ```
- **Response**: Mengembalikan status 201 Created atau status OK (200), dilengkapi objek tunggal dengan `id` dan `created_at` yang di-*generate* *database*.

## 4. Otorisasi & Row Level Security (RLS)

- **Cara Mengirim Token (Auth)**: 
  Autentikasi diurus penuh secara internal oleh JWT Supabase SDK. Token ditampung dalam antarmuka _LocalStorage_/_Session_. Segala panggilan `supabase.from()` secara otomatis membubuhkan _header_ `Authorization: Bearer <token>`.
- **Sistem Sinkronisasi Klien (React Zustand)**:
  Keberadaan token, login aktif, hingga identitas pengguna dikonfigurasi melalui perantara global state menggunakan Zustand (`useAuthStore`).
- **Row Level Security (RLS)**:
  Arsitektur ini sangat krusial. Seluruh tabel dalam skema TRASON memiliki restriksi SQL berikut yang memastikan klien JS hanya dapat memanipulasi *baris miliknya sendiri*.  
  Contoh *RLS Policy*: `(uid() = user_id)`.  
  Ini menghindari peretasan dari konsol API eksternal.
