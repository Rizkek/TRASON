# Database Schema & Security RLS Policies

Skema database TRASON di **Supabase** (Postgres). Definisi kolom lengkap setiap tabel ada di `src/types/database.ts`, yang menjadi sumber kebenaran. Dokumen ini memuat daftar tabel, aturan umum, dan rincian tabel inti.

## 1. Tabel yang dipakai kode

Diurutkan per domain. "Soft delete" berarti tabel punya kolom `deleted_at` di tipenya dan query harus menyertakan `.is('deleted_at', null)`.

| Domain | Tabel | Catatan |
|---|---|---|
| Akun | `users`, `user_preferences` | `users` disinkronkan dari `auth.users` lewat trigger; `users` soft delete |
| Finance | `categories`, `transactions`, `transaction_items`, `budgets`, `subscriptions`, `installments`, `installment_payments`, `receipt_metadata` | `categories` dan `transactions` soft delete. Struk yang diunggah ada di Storage bucket `receipts`, bukan tabel |
| Investments | `investment_positions`, `investment_price_snapshots` | `investment_positions` soft delete. Tipe `InvestmentGoalAllocation` dan `InvestmentTransaction` ada di `types/database.ts` tetapi belum punya tabel atau query yang dipakai |
| Schedule | `activities`, `activity_logs`, `daily_tasks`, `daily_task_logs` | `activities` dan `daily_tasks` soft delete |
| Reminders | `reminders`, `reminder_notifications`, `task_nudges` | `reminders` soft delete. Dua tabel lain adalah ledger pengiriman, hanya diakses service role |
| Push dan cron | `push_subscriptions`, `cron_runs` | satu langganan aktif per perangkat; hanya service role untuk `cron_runs` |
| Sport | `workout_plans`, `workout_days`, `workout_exercises`, `workout_sessions`, `personal_records` | `workout_plans` dan `workout_sessions` soft delete |
| Career | `career_applications`, `interview_journal` | keduanya soft delete |
| Insights | `insights`, `life_scores` | |

Tipe `Goal` ada di `types/database.ts` tetapi belum ada tabel `goals` yang dipakai kode.

Storage bucket: `receipts` (struk dan bukti payout, path milik user) dan `avatar`.

RPC: `get_transaction_analytics` dan `delete_user`.

## 2. Aturan umum

- **RLS aktif di semua tabel.** Tabel yang diakses klien memakai policy `auth.uid() = user_id` (pada `users`, `auth.uid() = id`). Tabel yang hanya diakses server dengan service role (`reminder_notifications`, `task_nudges`, `cron_runs`) boleh RLS aktif tanpa policy. Tabel baru wajib mengikuti aturan ini.
- **Tanggal tanpa jam** (`date`, `due_date`, `session_date`, `snapshot_date`, `record_date`) dibuat dengan helper `libs/date.ts` atau `libs/profileDate.ts`. Jangan memakai `toISOString().split('T')`, yang bergeser satu hari di timezone positif seperti UTC+7.
- **Waktu dengan jam** disimpan sebagai `timestamptz` (ISO dari `Date`).
- **Mata uang**: transaksi menyimpan `amount`, `original_amount`, `original_currency`, dan `exchange_rate_to_base`.

## 3. Tabel inti

### 3.1 `users`

Berpasangan dengan `auth.users`.

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | `uuid` PK | sama dengan `auth.uid()` |
| `email` | `varchar(255)` | unik, wajib |
| `first_name`, `last_name` | `varchar(100)` | |
| `avatar_url` | `varchar(500)` | |
| `email_verified` | `boolean` | default `false` |
| `phone`, `bio` | | |
| `created_at`, `updated_at`, `deleted_at` | `timestamptz` | `deleted_at` untuk soft delete |

### 3.2 `user_preferences`

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` unik | merujuk `users.id` |
| `theme` | `varchar(50)` | `light` atau `dark` |
| `language` | `varchar(10)` | `en`, `id`, `ja`, `es` |
| `currency` | `varchar(3)` | default `USD` |
| `timezone` | `varchar(50)` | default `UTC`; dipakai cron dan "hari ini" di klien |
| `notifications_enabled`, `push_notifications_enabled`, `email_digest_enabled` | `boolean` | default `true` |
| `digest_frequency` | `varchar` | default `weekly` |
| `module_features` | `jsonb` | toggle modul dan sub-fitur |
| `onboarding_done` | `boolean` | true setelah onboarding selesai |

### 3.3 `categories`

Unik pada `(user_id, name)`. Kolom: `name`, `icon` (nama ikon di `config/icons.ts`), `color` (hex), `type` (`income` atau `expense`).

### 3.4 `transactions`

Kolom utama: `title`, `amount` (> 0), `type` (`income`/`expense`), `date`, `category_id`, `original_amount`, `original_currency`, `exchange_rate_to_base`, `metadata` (jsonb).

### 3.5 `investment_positions`

Kolom utama: `asset_type` (`stock`, `crypto`, `gold`, `property`, `debt`, `vehicle`, `other`), `symbol`, `display_name`, `amount`, `buy_price`, `buy_date`, `quote_currency`, `price_source`, `external_id`, `manual_current_price`, `last_price`, `last_price_change_pct`, `last_valued_at`, `is_active`.

### 3.6 `push_subscriptions`, `reminder_notifications`, `task_nudges`, `cron_runs`

Didefinisikan di `docs/migrations/2026-10-15-push-reliability.sql` (kolom `failure_count`, `last_error`, `last_success_at` pada `push_subscriptions`). Jalankan manual di Supabase sebelum men-deploy perubahan cron.

## 4. Trigger sinkronisasi akun

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 5. Pola policy RLS

```sql
ALTER TABLE public.<tabel> ENABLE ROW LEVEL SECURITY;
CREATE POLICY "<singkatan>_all" ON public.<tabel> FOR ALL USING (auth.uid() = user_id);
```

Tabel `users` memakai `auth.uid() = id`. Karena `getCurrentUser()` di klien membaca sesi lokal tanpa validasi server, RLS adalah satu-satunya pagar data; periksa policy setiap tabel baru sebelum dipakai.
