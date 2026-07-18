# Finance Tracker (v2) — Laravel + React dalam 1 Project

## Fitur Baru di Versi Ini

1. **CRUD penuh** — transaksi bisa ditambah, **diedit**, dan dihapus (tombol pensil
   di tabel riwayat langsung memuat ulang form untuk diedit).
2. **Login pakai Username** (bukan email). Register: Nama Lengkap, Username,
   Password, Konfirmasi Password — dengan tombol toggle mata 👁 untuk lihat/sembunyikan
   password.
3. **Sidebar tidak bisa di-scroll** — tinggi mengikuti layar (sticky, fixed height).
4. **Pengaturan Akun** — menu baru di sidebar untuk update nama/username & ganti password.
5. **Role Admin** — user dengan role `admin` bisa membuka **Admin Panel**:
   - Kelola semua user (reset password siapa pun yang lupa, hapus user)
   - Kelola kategori sistem (tambah/hapus kategori default yang dipakai semua user)
6. **Lupa Password** — halaman baru, cukup masukkan **username**, langsung bisa
   set password baru (tanpa email/OTP). User juga bisa **menambahkan kategori sendiri**
   lewat tombol "+ Kategori baru" di form transaksi.
7. **Ikon menarik** — banyak pilihan ikon (uang, makanan, mobil/motor, bensin, listrik,
   air, hiburan, kesehatan, dll) lewat komponen Icon Picker bergambar, dipakai di
   seluruh tampilan kategori.
8. **Dashboard didesain ulang** — kartu gradient, dropdown kategori custom bergambar
   ikon, filter chip lebih rapi, circular gauge & tabel diperbaiki detailnya.

## Akun Bawaan (dari seeder / SQL dump)

| Username | Password | Role  |
|----------|----------|-------|
| `demo`   | password | user  |
| `admin`  | password | admin |

## Struktur Project

```
finance-tracker/
├── app/
│   ├── Http/Controllers/Api/  -> Auth, Category, Transaction, Dashboard, Admin
│   ├── Http/Middleware/        -> EnsureIsAdmin
│   └── Models/                 -> User, Category, Transaction
├── database/
│   ├── migrations/
│   └── seeders/                -> CategorySeeder, DemoDataSeeder (demo+admin), DatabaseSeeder
├── resources/
│   ├── css/app.css             -> Tailwind + font Poppins
│   ├── js/
│   │   ├── pages/               -> Login, Register, ForgotPassword, Dashboard,
│   │   │                          Income, Expense, Settings, Admin
│   │   ├── components/          -> Sidebar, TransactionForm/Table, CategorySelect,
│   │   │                          CategoryModal, IconPicker, PasswordInput, dst.
│   │   └── utils/iconMap.js     -> daftar ikon kurasi + mapping ke FontAwesome
│   └── views/app.blade.php
├── routes/{api.php, web.php}
└── ... (struktur Laravel standar lainnya)
```

## Instalasi

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate

# Buat database MySQL dulu:
#   mysql -u root -p -e "CREATE DATABASE finance_tracker;"

php artisan migrate --seed   # otomatis seed kategori + akun demo & admin
npm run dev
```

Buka `https://finance-tracker.test` (atau domain Herd/Laragon Anda).

### Alternatif: import SQL langsung
```bash
mysql -u root -p -e "CREATE DATABASE finance_tracker;"
mysql -u root -p finance_tracker < finance_tracker.sql
```
File ini sudah berisi struktur tabel terbaru (username, role) + kategori + akun
demo/admin siap pakai.

## Endpoint API Baru

| Method | Endpoint                             | Keterangan                              |
|--------|---------------------------------------|------------------------------------------|
| POST   | /api/check-username                   | Cek username ada/tidak (Lupa Password)   |
| POST   | /api/reset-password                   | Reset password via username saja         |
| PUT    | /api/profile                          | Update nama/username (perlu login)       |
| PUT    | /api/profile/password                 | Ganti password (perlu password lama)     |
| POST   | /api/categories                       | User membuat kategori sendiri            |
| PUT    | /api/categories/{id}                  | Update kategori milik sendiri            |
| DELETE | /api/categories/{id}                  | Hapus kategori milik sendiri             |
| GET    | /api/admin/users                      | (admin) List semua user                  |
| PUT    | /api/admin/users/{id}/reset-password  | (admin) Reset password user manapun      |
| DELETE | /api/admin/users/{id}                 | (admin) Hapus user                       |
| GET    | /api/admin/categories                 | (admin) List semua kategori              |
| POST   | /api/admin/categories                 | (admin) Buat kategori sistem baru        |
| PUT    | /api/admin/categories/{id}            | (admin) Update kategori manapun          |
| DELETE | /api/admin/categories/{id}            | (admin) Hapus kategori manapun           |

Login/Register tetap pakai Bearer Token (Sanctum), tanpa cookie/CSRF — aman
dipakai di satu domain seperti sekarang.
