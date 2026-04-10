# 🗄️ TRASON Database Setup Guide

Panduan lengkap untuk setup database PostgreSQL. Pilih **salah satu** dari 2 opsi di bawah.

---

## 📌 OPSI 1: PostgreSQL Local (Recommended untuk Development)

### Langkah 1: Install PostgreSQL
- **Windows**: Download dari [postgresql.org](https://www.postgresql.org/download/windows/)
- Pilih versi 14+ dan install ke default path
- Ingat password untuk user `postgres` (default)

### Langkah 2: Buat Database & User

Buka **pgAdmin** (aplikasi GUI) atau command line:

```bash
# Windows - Command Line
psql -U postgres

# Di PostgreSQL prompt, jalankan:
CREATE DATABASE trason_db;
CREATE USER trason_user WITH PASSWORD 'trason_secure_password_123';
GRANT ALL PRIVILEGES ON DATABASE trason_db TO trason_user;
\q
```

### Langkah 3: Update .env.local

Edit `backend/.env.local`:

```env
DATABASE_URL="postgresql://trason_user:trason_secure_password_123@localhost:5432/trason_db"
```

### Langkah 4: Push Schema ke Database

```bash
cd backend
npx prisma db push
```

**Output yang benar:**
```
Environment variables loaded from .env.local
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "trason_db" at "localhost:5432"

✔ Database created
✔ Migrations applied
✔ Generated Prisma Client
```

### Langkah 5: Start Backend Server

```bash
npm run dev
```

Expected output:
```
[2024-xx-xx xx:xx:xx] Server running on port 3001
[2024-xx-xx xx:xx:xx] Connected to database
```

---

## ☁️ OPSI 2: Supabase Cloud PostgreSQL (Recommended untuk Production)

### Langkah 1: Buat Supabase Account

1. Pergi ke [supabase.com](https://supabase.com)
2. Login dengan GitHub atau email
3. Klik "New Project"

### Langkah 2: Setup Project Baru

- **Name**: `TRASON`
- **Database Password**: Simpan password kuat! (misal: `trason_super_secure_pass_2024`)
- **Region**: Pilih terdekat dengan lokasi kamu
- Tunggu ~2 menit sampai project ready

### Langkah 3: Copy Connection String

Di Supabase dashboard:

1. Buka project TRASON
2. Pergi ke **Settings** → **Database** → **Connection Info**
3. Copy CONNECTION STRING (URI mode):

```
postgresql://postgres.xxxxxxxxxxxxx:yourpassword@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

Anda akan melihat:
- `postgres.xxxxx` = User
- `db.xxxxx` = Host
- Password = yang kamu set tadi

### Langkah 4: Update .env.local

Edit `backend/.env.local`:

```env
DATABASE_URL="postgresql://postgres.xxxxxxxxxxxxx:yourpassword@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"
```

### Langkah 5: Push Schema ke Supabase Database

Di terminal:

```bash
cd backend
npx prisma db push
```

### Langkah 6: Start Backend Server

```bash
npm run dev
```

**Verifikasi koneksi Supabase:**
1. Di Supabase dashboard → **SQL Editor**
2. Jalankan: `SELECT * FROM "User";` 
3. Harus return empty array (table terbuat tapi belum ada data)

---

## 🏃 Quick Start Commands

### 1. Jika belum pernah run Prisma:

```bash
cd backend

# Option A: Jika punya PostgreSQL local & .env.local sudah diupdate
npx prisma db push

# Option B: Generate Prisma Client (jika cuma update schema)
npx prisma generate
```

### 2. Jalankan backend server:

```bash
cd backend
npm run dev
```

### 3. Di terminal baru, jalankan frontend:

```bash
cd frontend
npm run dev
```

**Akses aplikasi:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API: http://localhost:3001/api/v1/*

---

## 🧪 Test Koneksi Database

### Test 1: Cek koneksi backend

```bash
# Di backend directory
ls -la && npm run dev
```

Jika koneksi OK, akan lihat:
```
✓ Server running on port 3001
✓ Connected to database trason_db
```

### Test 2: Cek migration sukses

```bash
psql -U trason_user -d trason_db -c "SELECT tablename FROM pg_tables WHERE schemaname='public';"
```

Harus return 11 tables:
- users
- transactions  
- activities
- reminders
- categories
- insights
- subscriptions
- notifications
- settings
- auditlogs
- etc.

### Test 3: Test signup dari frontend

1. Buka http://localhost:3000
2. Klik "Sign Up"
3. Isi form dengan:
   - Email: test@example.com
   - Password: Test123!@#
4. Klik "Create Account"

**Success Indicators:**
✅ Tombol loading, bukan error
✅ Akun terbuat (cek di database)
✅ Redirect ke dashboard atau login

---

## ❌ Troubleshooting

### "Network Error" saat signup?

1. **Cek backend running:**
   ```bash
   curl http://localhost:3001/api/v1/health
   ```
   Harus return `{"status":"ok"}`

2. **Cek DATABASE_URL:**
   ```bash
   cd backend
   echo $DATABASE_URL
   # Harus menampilkan connection string (bukan kosong)
   ```

3. **Cek Prisma schema:**
   ```bash
   npx prisma db push --force-reset
   ```

### "Permission denied" pada PostgreSQL local?

```bash
# Reset password postgres user
psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'new_password';"

# Update .env.local:
DATABASE_URL="postgresql://postgres:new_password@localhost:5432/trason_db"
```

### Connection timeout dari Supabase?

1. Cek network firewall konsol.supabase.com
2. Verifi password benar (copy-paste dari Supabase)
3. Cek region database match dengan server region

---

## 📋 Checklist Sebelum Mulai Development

- [ ] PostgreSQL sudah install OR Supabase account siap
- [ ] .env.local sudah diupdate dengan DATABASE_URL yang benar
- [ ] `npx prisma db push` executed dengan success
- [ ] Backend running di port 3001 tanpa error
- [ ] Frontend running di port 3000
- [ ] Signup test berhasil menciptakan user
- [ ] User data tersimpan di database

---

**🎉 Setup selesai! Siap untuk development TRASON PWA!**

Pertanyaan? Cek console output di backend untuk error details.
