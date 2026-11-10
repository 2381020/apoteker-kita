# ApotekerKita

Platform informasi obat digital Indonesia yang membantu pengguna memahami obat, memeriksa interaksi obat, menghitung dosis, mempelajari penggunaan obat, mencari apotek, dan mengelola jadwal minum obat.

Aplikasi ini menggunakan **React + Vite** di sisi klien dan **Supabase** sebagai backend (autentikasi, database PostgreSQL, dan Row Level Security).

## Teknologi

- React 19 + TypeScript + Vite
- Tailwind CSS
- shadcn/ui (primitif UI)
- Lucide React
- React Router
- React Hook Form + Zod
- **Supabase** (`@supabase/supabase-js`): Auth, Postgres, RLS
- Supabase CLI (migrasi database)

## Fitur

### Publik
- **Beranda** — ringkasan fitur dan manfaat platform
- **Informasi Obat** — daftar obat, generik, merk, kegunaan, efek samping, cara penyimpanan
- **Cek Interaksi** — pemeriksaan interaksi antara dua obat dengan tingkat keparahan
- **Kalkulator Dosis** — estimasi dosis berdasarkan berat badan, usia, dan frekuensi
- **Panduan Obat** — panduan penggunaan obat yang aman
- **Cari Apotek** — pencarian apotek mitra dengan jarak, rating, dan layanan
- **Tanya Apoteker** — asisten virtual berbasis aturan untuk seputar obat

### Terautentikasi (Pasien)
- **Dashboard** — ringkasan obat, pengingat aktif, dan riwayat hari ini
- **Pengingat Obat** — atur, aktifkan, nonaktifkan, dan hapus jadwal minum obat
- **Riwayat Konsumsi** — catatan obat yang telah dikonsumsi
- **Profil Saya** — data pribadi dan preferensi
- **Pengaturan** — preferensi notifikasi dan keluar

### Admin (berbasis peran)
- **Dashboard Admin** — statistik obat, interaksi, panduan, apotek
- **Kelola Obat / Interaksi / Panduan / Apotek** — CRUD data referensi
- **Kelola Pengguna** — daftar profil pengguna terdaftar

## Setup Supabase

### 1. Buat project

1. Buka [dashboard.supabase.com](https://dashboard.supabase.com) dan buat project baru.
2. Buka **Project Settings → API**, catat **Project URL** dan **anon/public key**.

### 2. Konfigurasi environment

```bash
cp .env.example .env.local
```

Isi `.env.local`:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

> `SUPABASE_SERVICE_ROLE_KEY` hanya diperlukan untuk script seed akun demo. Jangan pernah memakai prefix `VITE_` untuk service role key.

### 3. Jalankan migrasi

Migrasi ada di `supabase/migrations/` dan dijalankan berurutan:

1. `*_init_schema.sql` — tabel, enum, trigger, profil otomatis
2. `*_rls_policies.sql` — kebijakan Row Level Security
3. `*_seed_reference_data.sql` — data awal obat, interaksi, apotek, panduan

**Opsi A — SQL Editor (tanpa Docker):**

Buka **SQL Editor** di dashboard Supabase, lalu jalankan isi ketiga file tersebut sesuai urutan.

**Opsi B — Supabase CLI:**

```bash
supabase link --project-ref <project-ref>
npm run db:push
```

> Docker tidak diperlukan untuk `db push` ke project remote. `supabase start` (database lokal) memerlukan Docker.

### 4. Seed akun demo (opsional)

Tambahkan service role key ke `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Lalu jalankan:

```bash
npm run seed:users
```

Akun yang dibuat:

| Peran | Email | Kata sandi |
|-------|-------|------------|
| Pasien | `pasien@apotekerkita.com` | `pasien123` |
| Admin | `admin@apotekerkita.com` | `admin123` |

Script ini juga mempromosikan akun admin ke role `admin` di tabel `profiles`.

### 5. Konfirmasi email

Untuk pengembangan cepat, nonaktifkan **Authentication → Providers → Email → Confirm email** di dashboard Supabase. Jika fitur konfirmasi aktif, pengguna harus mengonfirmasi email sebelum bisa masuk. Script seed sudah membuat akun dengan email terkonfirmasi.

### 6. Generate tipe database (opsional)

Setelah project ter-link:

```bash
npm run db:types
```

## Jalankan Secara Lokal

```bash
npm install
npm run dev
```

Aplikasi berjalan di `http://localhost:5173`.

```bash
# Build produksi
npm run build

# Pratinjau hasil build
npm run preview
```

## Struktur Proyek

```
src/
  app/          Providers (auth Supabase), App, router
  components/   ui, layout, shared
  features/     auth, dashboard, profile, chatbot, medications, interactions,
                dosage-calculator, medication-guides, pharmacy, reminders, admin
  hooks/        useAuth (Supabase Auth context)
  lib/          supabase client, database types, utils
  services/     akses data Supabase per domain
  types/        TypeScript types
supabase/
  config.toml
  migrations/   skema, RLS, seed data referensi
scripts/
  seed-users.mjs
```

## Model Data

| Tabel | Keterangan |
|-------|------------|
| `profiles` | Profil pengguna, 1:1 dengan `auth.users`, menyimpan role |
| `medications` | Data referensi obat |
| `interactions` | Data interaksi antar obat |
| `pharmacies` | Data apotek mitra |
| `guides` | Panduan/artikel kesehatan |
| `reminders` | Pengingat obat milik pengguna |
| `consumption_history` | Riwayat konsumsi milik pengguna |

## Keamanan

- Autentikasi memakai Supabase Auth (email + kata sandi).
- Semua tabel memakai Row Level Security.
- Data referensi dapat dibaca publik, tetapi hanya admin (`profiles.role = 'admin'`) yang dapat menulis.
- Pengingat dan riwayat hanya dapat diakses pemiliknya atau admin.
- Role pengguna baru selalu `patient`; promosi admin dilakukan lewat service role/seed script.
- Service role key tidak boleh dimasukkan ke variabel `VITE_*` atau kode klien.

## Deploy ke Vercel

1. Push repositori ke GitHub.
2. Impor proyek di Vercel (preset **Vite**).
3. Build command: `npm run build`
4. Output directory: `dist`
5. Tambahkan environment variables `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
6. Deploy.

## Catatan Medis

Ini adalah aplikasi demonstrasi, bukan sistem medis produksi. Selalu konsultasikan dokter atau apoteker sebelum menggunakan obat.

## Lisensi

MIT
