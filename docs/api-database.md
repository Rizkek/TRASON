# API & Database Documentation

## 1. Arsitektur komunikasi data

Ada dua jalur data:

1. **Klien langsung ke Supabase.** Hook memanggil `services/*Queries`, yang memakai browser client `supabase.from()` di bawah RLS. Hanya folder `services/` yang boleh memanggil `supabase.from()`. Setiap query dibungkus `withAuthQuery` (mengambil user lewat `getSession()`, sengaja bukan `getUser()`) dan error dipetakan lewat `logError` dan `handleQueryError` (`libs/apiErrors.ts`).
2. **Route handler Next.js** di `src/app/api` untuk hal yang tidak boleh atau tidak bisa dilakukan di klien: AI, harga pasar, push, cron, validasi email.

Dokumentasi payload route yang lebih rinci untuk sebagian route ada di `docs/API_DOCUMENTATION.md`.

## 2. Route API

Middleware tidak melindungi `/api` (dikecualikan dari matcher). Tiap route wajib memverifikasi sendiri dengan `getAuthenticatedUser()` dan mengembalikan 401. Pengecualian: `validate-email` (publik) dan `cron/*` (memakai `CRON_SECRET` dan service role).

| Route | Fungsi |
|---|---|
| `parse` | Smart Input: bahasa natural menjadi transaksi atau task |
| `finance/extract-receipt`, `extract-driver-payout`, `upload-receipt` | OCR struk dan payout driver via Gemini vision, validasi deterministik |
| `insights/generate`, `investments/insights` | ringkasan insight |
| `investments/prices` | harga CoinGecko dan Alpha Vantage |
| `analytics/life-score` | Life Score dihitung di server |
| `career/autocomplete`, `holidays`, `sport/exercises` | data pendukung |
| `push/subscribe` | dipanggil service worker saat endpoint push berputar (`pushsubscriptionchange`) |
| `cron/reminders`, `cron/timeline`, `cron/digest` | web-push dan email digest, dipanggil cron-job.org |
| `validate-email` | cek MX lewat DNS-over-HTTPS |

Server tidak boleh mem-fetch URL yang dikirim klien. Route receipt hanya menerima path storage milik user (`libs/receiptStorage.ts`), dan `GeminiReceiptExtractor` hanya menerima data URL.

RPC yang dipakai kode: `get_transaction_analytics` dan `delete_user`.

## 3. Tabel

Daftar tabel yang dipakai kode dan aturan umumnya ada di `docs/DATABASE_SCHEMA.md`. Definisi kolom lengkap ada di `src/types/database.ts`.

Aturan yang berlaku untuk semua tabel:

- RLS aktif, policy `auth.uid() = user_id`.
- Tabel dengan kolom `deleted_at` memakai soft delete; query selalu menyertakan `.is('deleted_at', null)`.
- Tanggal tanpa jam (`date`, `due_date`, `session_date`) dibuat dengan helper di `libs/date.ts` atau `libs/profileDate.ts`, bukan `toISOString().split('T')`.

## 4. Contoh: menambah transaksi

```ts
const payload = {
  title: 'Gaji Bulanan',
  amount: 5000000,
  type: 'income',
  category_id: '<uuid kategori>',
  date: '2026-06-16',
  original_currency: 'IDR',
  exchange_rate_to_base: 0.000062,
};

// userId datang dari withAuthQuery; RLS menolak baris milik user lain.
const { data, error } = await supabase.from('transactions').insert([{ ...payload, user_id: userId }]).select().single();
```

## 5. Otorisasi

- Token diurus oleh Supabase SDK dan dikirim otomatis sebagai `Authorization: Bearer <token>`.
- `AuthProvider` memanggil `useAuth()` sekali sebagai satu-satunya subscription `onAuthStateChange`; komponen lain membaca `useAuthStore`.
- `getCurrentUser()` membaca sesi lokal tanpa validasi server, jadi keamanan data bergantung penuh pada RLS.
