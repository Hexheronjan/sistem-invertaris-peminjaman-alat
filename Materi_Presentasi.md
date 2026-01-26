# Materi Presentasi Lengkap (16 Slide) & Naskah: Aplikasi Inventaris UKK 2024/2025

Dokumen ini disusun untuk durasi presentasi sekitar 10-15 menit. Terdiri dari **16 Slide** padat berisi materi esensial dan teknis untuk ujian kompetensi.

---

## Slide 1: Judul Project
**Isi Slide:**
*   **Judul:** Rancang Bangun Aplikasi Inventaris Peminjaman Alat Berbasis Web
*   **Studi Kasus:** [Nama Sekolah Anda]
*   **Disusun Oleh:** [Nama Anda]
*   **NISN / Kelas:** [NISN] / [Kelas]
*   *(Tambahkan Logo Sekolah & Logo UKK jika ada)*

> **🗣️ Naskah Presentasi:**
> "Assalamualaikum Wr. Wb. Selamat pagi Bapak/Ibu Penguji.
> Perkenalkan, nama saya [Nama Anda] dari kelas [Kelas]. Pada kesempatan UKK tahun ini, saya mengangkat judul 'Rancang Bangun Aplikasi Inventaris Peminjaman Alat Berbasis Web'.
> Aplikasi ini saya buat sebagai solusi untuk memodernisasi sistem pendataan barang di laboratorium sekolah kita."

---

## Slide 2: Latar Belakang Masalah
**Isi Slide:**
*   **Kondisi Saat Ini:** Pencatatan peminjaman masih manual (Buku Tulis).
*   **Permasalahan:**
    1.  Data mudah hilang/rusak/basah.
    2.  Petugas kesulitan merekap laporan bulanan.
    3.  Peminjaman sering tumpang tindih (stok fisik habis tapi tercatat ada).
    4.  Siswa tidak tahu informasi stok alat secara *real-time*.

> **🗣️ Naskah Presentasi:**
> "Latar belakang proyek ini berawal dari pengamatan saya di ruang alat. Saat ini, semua transaksi masih dicatat di buku besar.
> Hal ini memunculkan banyak masalah: tulisan yang sulit dibaca, buku yang rawan hilang, hingga kesulitan petugas saat harus membuat laporan akhir bulan. Selain itu, siswa sering kecewa karena saat datang ke ruang alat, ternyata barang yang dicari sudah habis dipinjam, padahal mereka tidak punya akses informasi stok dari rumah."

---

## Slide 3: Rumusan Masalah & Batasan
**Isi Slide:**
*   **Rumusan Masalah:** Bagaimana merancang sistem informasi yang dapat mengelola data alat, peminjaman, dan pengembalian secara terkomputerisasi?
*   **Batasan Masalah:**
    *   Sistem berbasis Web (Akses Browser).
    *   Hanya mencakup proses Peminjaman, Pengembalian, dan Laporan.
    *   Pengguna terdiri dari Admin, Petugas, dan Siswa.

> **🗣️ Naskah Presentasi:**
> "Berdasarkan kondisi tersebut, saya merumuskan masalah: 'Bagaimana cara membuat sistem yang bisa mendigitalkan seluruh proses manual tersebut?'.
> Agar pengerjaan lebih fokus, saya membatasi fitur pada manajemen alat, transaksi sirkulasi barang, dan pembuatan laporan otomatis. Sistem ini ditujukan untuk 3 pengguna utama: Admin Laboratorium, Petugas Jaga, dan Siswa."

---

## Slide 4: Tujuan & Manfaat
**Isi Slide:**
*   **Tujuan:**
    1.  Mempermudah sirkulasi peminjaman alat.
    2.  Menyediakan data inventaris yang akurat & *real-time*.
*   **Manfaat:**
    *   **Bagi Sekolah:** Efisiensi waktu & keamanan aset terjaga.
    *   **Bagi Siswa:** Kemudahan akses katalog alat dari mana saja.
    *   **Bagi Petugas:** Pelaporan otomatis tanpa rekap manual.

> **🗣️ Naskah Presentasi:**
> "Tujuan utamanya jelas: efisiensi. Kami ingin mengubah proses yang tadinya butuh 5-10 menit menulis di buku menjadi hanya beberapa klik saja.
> Manfaatnya, sekolah bisa menekan angka kehilangan aset karena semua terlacak sistem. Siswa pun terbantu karena bisa melihat katalog alat dari HP masing-masing sebelum praktikum."

---

## Slide 5: Landasan Teori & Teknologi (Tech Stack)
**Isi Slide:**
*   **Metode Pengembangan:** Waterfall / Prototype *(pilih satu)*.
*   **Framework:** Next.js 14 (React) - *Frontend & Backend*.
*   **Database:** PostgreSQL (Relational DB).
*   **ORM:** Prisma (Akses Data Aman).
*   **Styling:** Tailwind CSS (Modern UI).

> **🗣️ Naskah Presentasi:**
> "Untuk membangun aplikasi ini, saya menggunakan teknologi standar industri modern.
> Saya memilih **Next.js** karena performanya yang cepat sebagai Fullstack Framework.
> Desain antarmuka menggunakan **Tailwind CSS** agar responsif di HP maupun Laptop.
> Dan untuk database, saya menggunakan **PostgreSQL** yang terkenal tangguh untuk data transaksional, dipadukan dengan **Prisma ORM** untuk mempercepat proses coding dan meminimalisir bug query."

---

## Slide 6: Analisis Sistem (Alur Bisnis)
**Isi Slide:**
*   *(Gambarkan Flowchart Sederhana)*
    *   **Siswa:** Login -> Cari Alat -> Klik Pinjam.
    *   **Sistem:** Cek Stok -> Create Request (Status: Pending).
    *   **Petugas:** Cek Dashboard -> Verifikasi (Approve/Reject).
    *   **Sistem:** Kurangi Stok (Jika Approve).
    *   **Petugas:** Terima Barang -> Klik Kembali -> Cek Denda.

> **🗣️ Naskah Presentasi:**
> "Secara garis besar, alur sistem berjalan seperti ini: Siswa mengajukan peminjaman via aplikasi. Permintaan masuk ke dashboard Petugas sebagai 'Antrian'.
> Petugas melakukan verifikasi. Begitu disetujui, stok alat otomatis berkurang.
> Nanti saat pengembalian, Petugas tinggal klik tombol 'Kembalikan', dan sistem akan otomatis menghitung apakah ada keterlambatan atau tidak."

---

## Slide 7: Perancangan Database (ERD)
**Isi Slide:**
*   **Tabel Utama:**
    1.  `User` (Data Pengguna & Role)
    2.  `Alat` (Data Barang & Stok)
    3.  `Kategori` (Pengelompokan Alat)
    4.  `Peminjaman` (Transaksi Sirkulasi)
    5.  `Pengembalian` (Pencatatan Denda & Waktu Kembali)
*   **Relasi:** *One-to-Many* (1 User bisa banyak Peminjaman).

> **🗣️ Naskah Presentasi:**
> "Jantung dari aplikasi ini adalah desain databasenya. Saya memiliki 5 tabel utama.
> Tabel `Peminjaman` terhubung dengan `User` dan `Alat` menggunakan relasi One-to-Many.
> Saya juga memisahkan tabel `Pengembalian` agar pencatatan denda dan tanggal aktual kembali bisa tersimpan rapi tanpa mengganggu tabel transaksi utama."

---

## Slide 8: Implementasi Antarmuka (UI Design)
**Isi Slide:**
*   **Tema:** Professional Light Mode (Clean & Enterprise Look).
*   **Fitur UX:**
    *   *Show/Hide Password* (Keamanan visual).
    *   *Real-time Search* (Pencarian alat cepat).
    *   *Responsive Sidebar* (Menu navigasi dinamis).
    *   *Interactive Feedback* (Modal Alert / Toast Notification).

> **🗣️ Naskah Presentasi:**
> "Di sesi implementasi antarmuka, saya fokus pada 'User Experience'.
> Tampilannya menggunakan konsep 'Clean Light Mode' yang terlihat profesional seperti aplikasi perkantoran.
> Saya menambahkan fitur-fitur kecil namun penting seperti tombol 'Intip Password' saat login, pencarian alat yang instan, dan notifikasi popup yang interaktif agar pengguna tidak bingung saat menggunakan aplikasi."

---

## Slide 9: Keamanan Sistem (Security)
**Isi Slide:**
1.  **Middleware Protection:** Mencegah akses tanpa login (Redirect ke Login).
2.  **Role-Based Access Control (RBAC):**
    *   Siswa tidak bisa masuk halaman Admin.
    *   Admin tidak bisa sembarangan pinjam.
3.  **Password Hashing:** Password tidak disimpan polos (Plain Text), tapi terenkripsi.

> **🗣️ Naskah Presentasi:**
> "Aplikasi ini tidak hanya soal visual, tapi juga keamanan.
> Saya menerapkan **Middleware** yang memblokir akses ilegal. Jika ada yang mencoba buka halaman Admin tanpa login, akan langsung 'ditendang' ke halaman Login.
> Selain itu, password pengguna tidak bisa dibaca oleh siapa pun (termasuk Admin) karena dienkripsi di dalam database."

---

## Slide 10: Hasil Pengujian (Testing)
**Isi Slide:**
*   **Metode:** Black Box Testing.
*   **Hasil:**
    1.  Login Valid/Invalid -> **Sukses**.
    2.  Cek Stok Kosong -> **Tombol Pinjam Disabled (Sukses)**.
    3.  Hitung Denda Terlambat -> **Akurat (Sukses)**.
    4.  Cetak Laporan -> **Terunduh (Sukses)**.

> **🗣️ Naskah Presentasi:**
> "Berdasarkan pengujian Black Box yang saya lakukan, seluruh fitur fungsional berjalan 100%.
> validasi stok berfungsi (tidak bisa pinjam barang kosong), perhitungan denda akurat sesuai jumlah hari terlambat, dan fitur cetak laporan berhasil meng-generate file yang siap print."

---

## Slide 11: Kesimpulan
**Isi Slide:**
1.  Aplikasi berhasil mendigitalisasi proses manual menjadi otomatis.
2.  Sistem mampu menyajikan data stok dan laporan secara *real-time*.
3.  Meminimalisir risiko kehilangan aset sekolah.

> **🗣️ Naskah Presentasi:**
> "Kesimpulannya, aplikasi ini telah berhasil menjawab rumusan masalah di awal.
> Proses administrasi kini jauh lebih cepat, data aset lebih transparan, dan risiko kehilangan barang dapat diminimalisir karena setiap pergerakan barang tercatat 'by system' dan memiliki jejak digital (Log)."

---

## Slide 12: Penutup
**Isi Slide:**
*   Terima Kasih.
*   **Quote:** *"Technology is best when it brings people together."*
*   Sesi Tanya Jawab (Q&A).

> **🗣️ Naskah Presentasi:**
> "Sekian presentasi dari saya. Terima kasih atas perhatian Bapak/Ibu.
> Saya sangat terbuka untuk saran dan pertanyaan guna penyempurnaan aplikasi ini ke depannya.
> Wassalamualaikum Wr. Wb. Silakan jika ada pertanyaan."

---

## Slide 13: Struktur Kode (Code Structure)
**Isi Slide:**
*   **Folder Structure (App Router):**
    *   `src/app/api` -> Backend Routes (Server-side logic).
    *   `src/app/(dashboard)` -> Halaman Frontend (Client-side).
    *   `src/components` -> UI Parts (Sidebar, Modal, Card).
    *   `src/lib` -> Konfigurasi (Prisma Client, Auth Helper).
*   **Konsep:** *File-based Routing* (Nama folder = URL).

> **🗣️ Naskah Penjelasan:**
> "Masuk ke aspek teknis. Aplikasi ini menggunakan struktur **App Router** terbaru dari Next.js.
> Semua logika backend (API) saya pisahkan rapi di folder `api`, sedangkan tampilan antarmuka ada di folder `app`.
> Saya juga menggunakan komponen modular di folder `components` agar kodingan tidak berantakan dan bisa dipakai ulang (reusable)."

---

## Slide 14: Bedah Database (Schema.prisma)
**Isi Slide:**
*(Tampilkan potongan kode `schema.prisma`)*
```prisma
model Peminjaman {
  id_pinjam String @id @default(uuid())
  status    String // 'pending', 'approved'
  user      User   @relation(fields: [userId], ...)
  alat      Alat   @relation(fields: [alatId], ...)
}
```

> **🗣️ Naskah Penjelasan:**
> "Ini adalah kode definisi database saya menggunakan **Prisma Schema**.
> Bisa dilihat, saya mendefinisikan model `Peminjaman` yang memiliki relasi (hubungan) ke tabel `User` dan `Alat`.
> Kode `@relation` inilah yang memastikan data konsisten: kita tidak bisa input peminjaman untuk user yang tidak terdaftar."

---

## Slide 15: Logika Backend (API Route)
**Isi Slide:**
*(Tampilkan potongan kode `POST /api/peminjaman`)*
*   **Validasi:** Cek stok sebelum simpan.
*   **Transaksi:** Gunakan `prisma.$transaction`.
*   **Response:** Kembalikan JSON status 201 (Created).

> **🗣️ Naskah Penjelasan:**
> "Untuk logika peminjaman, saya tidak asal simpan.
> Di dalam kodingan API, sistem pertama-tama akan mengecek: *'Apakah stok barang > 0?'*.
> Jika ya, baru data disimpan. Jika tidak, sistem langsung menolak dan mengirim pesan error. Ini mencegah stok minus di database."

---

## Slide 16: Keamanan Middleware
**Isi Slide:**
*   **JWT (JSON Web Token):** Untuk identifikasi user login.
*   **Middleware Logic:**
    ```javascript
    if (url.startsWith('/admin') && user.role !== 'admin') {
      return NextResponse.redirect('/login');
    }
    ```

> **🗣️ Naskah Penjelasan:**
> "Bagaimana saya menjaga keamanan? Saya memasang 'Satpam Digital' bernama **Middleware**.
> Kode sesimpel ini (tunjuk slide) sangat ampuh. Setiap kali ada yang mau masuk halaman Admin, kode ini akan memeriksa jabatannya. Kalau bukan Admin, langsung dilempar keluar ke halaman Login."

---

# 🎓 LAMPIRAN: Cheat Sheet Bedah Kode (Untuk Jawab Pertanyaan Penguji)

Berikut adalah jawaban santai namun teknis jika penguji menyuruh Anda: *"Coba jelaskan baris kode ini maksudnya apa!"*

### 1. Pertanyaan: "Jelaskan file `prisma/schema.prisma`!"
**Jawaban:**
"File ini adalah **Blueprint Database** kita, Pak.
*   `model` itu artinya Tabel.
*   `@id @default(uuid())` artinya Primary Key-nya dibuat otomatis berupa kode acak unik (UUID), jadi lebih aman daripada angka urut 1, 2, 3.
*   `@relation` itu Foreign Key, penghubung antar tabel."

### 2. Pertanyaan: "Gimana cara `src/app/page.js` (Login) bekerja?"
**Jawaban:**
"Di sini saya pakai **React Hooks** yaitu `useState`.
*   Variabel `username` dan `password` menampung ketikan user.
*   Saat tombol diklik (`handleLogin`), aplikasi 'menembak' API `/api/auth/login`.
*   Kalau sukses, data user disimpan di `localStorage` (memori browser) biar tidak perlu login ulang terus."

### 3. Pertanyaan: "Apa itu `await prisma.alat.findMany()`?"
**Jawaban:**
"Itu perintah untuk mengambil data dari database, Pak.
*   `await`: Artinya 'Tunggu dulu sampai datanya dapat', baru lanjut ke baris bawahnya (Asynchronous).
*   `prisma.alat`: Masuk ke tabel Alat.
*   `findMany`: Ambil banyak data (semua data). Kalau `findUnique` cuma satu."

### 4. Pertanyaan: "Di Dashboard, kok angkanya bisa muncul real-time?"
**Jawaban:**
"Itu karena saya menggunakan `useEffect`.
Begitu halaman dibuka, `useEffect` langsung jalan otomatis memanggil API Dashboard. API itu menghitung data di database pakai fungsi `count()` dari Prisma, lalu hasilnya dikirim balik ke layar."

### 5. Pertanyaan: "Kenapa pakai `className` (Tailwind) panjang-panjang gitu?"
**Jawaban:**
"Itu namanya **Utility Class**, Bu.
Daripada kita buat file CSS terpisah lalu bolak-balik ngecek nama class, dengan Tailwind kita langsung styling di situ.
Contoh: `bg-blue-500` berarti *Background warna Biru*, `p-4` berarti *Padding 4*. Lebih cepat develop-nya."
---

# 📋 REFERENSI DETAIL UNTUK SLIDE CANVA (ALUR MENYELURUH)

Bagian ini dibuat khusus agar Anda bisa copy-paste penjelasan **Super Lengkap** ke dalam Desain Canva Anda.

## 1. Role: ADMINISTRATOR (Admin)
**Deskripsi:** Pengendali penuh sistem dan satu-satunya yang bisa mengelola User.

**Fitur & Kemampuan:**
*   ✅ **Akses Full:** Bisa melihat semua menu (Dashboard, Alat, User, Peminjaman).
*   ✅ **Manajemen User:** Bisa membuat akun baru untuk Petugas & Siswa.
*   ✅ **Generate Laporan:** Bisa download laporan PDF untuk Kepala Sekolah.
*   ✅ **Override Sistem:** Bisa menghapus data master (Kategori/Alat) jika diperlukan.

**Alur Kerja Admin:**
1.  **Input Data Awal:** Admin login -> Menu Kategori (Input: "Elektronik") -> Menu Alat (Input: "Laptop", Stok: 5).
2.  **Registrasi User:** Admin mendaftarkan akun untuk Petugas Baru.
3.  **Monitoring:** Setiap pagi Admin cek Dashboard untuk lihat grafik peminjaman.

---

## 2. Role: PETUGAS (Operator Lab)
**Deskripsi:** Garda terdepan dalam pelayanan peminjaman dan pengembalian barang.

**Fitur & Kemampuan:**
*   ✅ **Verifikasi:** Tombol "Setuju" atau "Tolak" ada di akun Petugas.
*   ✅ **Cek Fisik:** Memastikan barang yang kembali tidak rusak.
*   ✅ **Input Denda:** Menagih denda jika siswa terlambat.

**Alur Kerja Petugas:**
1.  **Terima Notifikasi:** Login -> Lihat tabel "Antrian Peminjaman".
2.  **Validasi:** Cek apakah siswa ini punya masalah/tanggungan? Jika aman -> Klik **Approve**.
3.  **Serah Terima:** Mengambil barang dari lemari -> Serahkan ke siswa -> Status jadi "Dipinjam".
4.  **Pengembalian:** Terima barang dari siswa -> Cek kondisi -> Klik **Kembalikan**.

---

## 3. Role: PEMINJAM (Siswa/Guru)
**Deskripsi:** Pengguna akhir yang hanya bisa melakukan request (permohonan).

**Fitur & Kemampuan:**
*   ✅ **Katalog Online:** Bisa lihat stok dari HP masing-masing.
*   ✅ **Request Pinjam:** Booking alat tanpa harus antri tulis buku.
*   ✅ **Cek Riwayat:** Bisa lihat tanggal harus kembali.

**Alur Kerja Peminjam:**
1.  **Browsing:** Login -> Buka halaman Alat -> Cari "Kamera DSLR".
2.  **Booking:** Klik tombol **Pinjam**. (Saat ini stok di sistem berkurang sementara).
3.  **Menunggu:** Status "Menunggu Verifikasi".
4.  **Ambil Barang:** Jika status berubah "Disetujui", datang ke Admin ambil barang.

---

# 🔄 SKENARIO ALUR SISTEM (STEP-BY-STEP)

Silakan copy poin-poin ini untuk halaman "Cara Kerja Aplikasi" di Canva:

### Tahap 1: Pengajuan (Booking)
1.  **Siswa** login ke aplikasi menggunakan NISN.
2.  Masuk menu **Daftar Alat**.
3.  Memilih barang yang *Available* (Stok > 0).
4.  Klik **Pinjam** -> Sistem mencatat tanggal request.

### Tahap 2: Persetujuan (Approval)
1.  **Petugas** melihat data masuk di Dashboard.
2.  Petugas memverifikasi identitas siswa.
3.  Petugas menekan tombol **Setuju**.
4.  Stok barang di database resmi berkurang.

### Tahap 3: Pengembalian & Denda
1.  Siswa mengembalikan barang fisik.
2.  Petugas menekan tombol **Kembalikan** pada nama siswa tersebut.
3.  **Sistem Otomatis Cek:**
    *   Apakah tanggal sekarang > tanggal wajib kembali?
    *   Jika **YA**: Muncul hitungan denda (Misal: Telat 2 hari x Rp 5.000 = Rp 10.000).
    *   Jika **TIDAK**: Denda Rp 0.
4.  Transaksi selesai, stok barang bertambah kembali.
