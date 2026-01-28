# Sistem Inventaris Peminjaman Alat

Proyek ini adalah aplikasi web untuk manajemen peminjaman alat, dibangun menggunakan [Next.js](https://nextjs.org) dan [Prisma](https://www.prisma.io/).

## Prasyarat

Sebelum memulai, pastikan perangkat Anda telah terinstal:

- [Node.js](https://nodejs.org/) (Versi 18 atau lebih baru)
- [PostgreSQL](https://www.postgresql.org/) (Database)

## Instalasi

Ikuti langkah-langkah berikut untuk menjalankan proyek di komputer lokal Anda:

1.  **Clone repositori** (atau unduh source code):
    ```bash
    git clone https://github.com/Hexheronjan/sistem-invertaris-peminjaman-alat.git
    cd sistem-invertaris-peminjaman-alat
    ```

2.  **Instal dependensi**:
    Jalankan perintah berikut di terminal:
    ```bash
    npm install
    ```

## Konfigurasi Lingkungan (Environment Setup)

Buat file bernama `.env` di direktori root proyek (sejajar dengan `package.json`). Salin konfigurasi di bawah ini dan sesuaikan dengan pengaturan database lokal Anda.

**Template `.env`:**

```env
# Koneksi Database PostgreSQL
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:password123@localhost:5432/inventaris_db?schema=public"

# Kunci Rahasia untuk JWT (Ganti dengan string acak yang aman)
JWT_SECRET="rahasia-super-aman-ubah-ini-sekarang"
```

> **Catatan:** Pastikan Anda telah membuat database (misalnya `inventaris_db`) di PostgreSQL sebelum melanjutkan.

## Konfigurasi Database

Setelah file `.env` dikonfigurasi, jalankan perintah berikut untuk menyiapkan database:

1.  **Generate Prisma Client**:
    ```bash
    npx prisma generate
    ```

2.  **Push Schema ke Database**:
    Perintah ini akan membuat tabel-tabel di database Anda sesuai dengan skema yang ada.
    ```bash
    npx prisma db push
    ```
    
    *Alternatif jika ingin menggunakan migration:*
    ```bash
    npx prisma migrate dev --name init
    ```

## Menjalankan Proyek

Untuk menjalankan aplikasi dalam mode development:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

## Struktur Database

Aplikasi ini menggunakan struktur database relasional dengan model-model berikut (didefinisikan di `prisma/schema.prisma`):

- **User (`users`)**: Menyimpan data pengguna aplikasi (Admin, Petugas, Peminjam).
- **Role (`roles`)**: Menyimpan level akses/peran pengguna.
- **Alat (`alat`)**: Menyimpan data inventaris alat yang tersedia untuk dipinjam.
- **Kategori (`kategori`)**: Pengelompokan jenis alat.
- **Peminjaman (`peminjaman`)**: Mencatat transaksi peminjaman alat.
- **Pengembalian (`pengembalian`)**: Mencatat detail saat alat dikembalikan, termasuk denda jika ada.
- **LogAktivitas (`log_aktivitas`)**: Mencatat riwayat aktivitas yang dilakukan oleh pengguna dalam sistem.

### Setup Database Manual (Opsional)
Jika Anda tidak menggunakan Prisma Migration atau ingin melihat skema lengkap beserta Trigger dan Function yang digunakan, Anda dapat menggunakan file SQL yang telah disediakan:
`database_setup.sql`

File tersebut berisi definisi tabel, relation, function, dan trigger yang dibutuhkan oleh aplikasi ini.

### Trigger & Procedure
Aplikasi ini menggunakan beberapa Database Trigger untuk otomatisasi (seperti pengurangan stok otomatis). Definisi lengkap dapat ditemukan di `database_setup.sql`.