# Panduan Pengujian Fitur Barang Rusak

Berikut adalah langkah-langkah untuk mencoba fitur Barang Rusak yang terintegrasi dengan Peminjaman:

## 1. Persiapan
Pastikan Anda memiliki setidaknya satu User siswa/anggota dan satu Alat dengan stok tersedia.

## 2. Tahap Peminjaman (Wajib dilakukan dulu)
Fitur ini bekerja saat barang **dikembalikan**, jadi barang harus dipinjam terlebih dahulu.
1.  Login sebagai **Peminjam** (Siswa/Guru).
2.  Lakukan peminjaman alat.
3.  Login sebagai **Admin/Petugas**.
4.  Buka menu **Peminjaman**.
5.  Pastikan status peminjaman adalah **"Disetujui"** (Jika masih "Pengajuan", silakan terima dulu).

## 3. Tahap Pengembalian "Rusak"
1.  Di menu **Peminjaman** (Admin), cari peminjaman tadi.
2.  Klik tombol **Proses Kembali**.
3.  Akan muncul popup konfirmasi.
4.  Pada kolom **Kondisi Barang**, ubah dari "Baik" menjadi **"Rusak"**.
5.  Isi keterangan kerusakan (contoh: "Layar pecah").
6.  Klik **Konfirmasi**.

## 4. Verifikasi Hasil
1.  Buka menu **Manajemen Alat** (Admin).
2.  Cari alat yang baru saja dikembalikan.
3.  Lihat kolom stok:
    *   **Stok (Utama)**: Seharusnya **TIDAK BERTAMBAH** (tetap seperti saat barang sedang dipinjam).
    *   **Rusak**: Seharusnya **BERTAMBAH 1**.
    *   *Contoh*: Awal 10 -> Pinjam 1 (Sisa 9) -> Kembali Rusak -> Stok tetap 9, Rusak jadi 1.

## 5. Tahap Perbaikan (Restock)
1.  Di kartu alat tersebut, Anda akan melihat tombol **Benarkan** (warna hijau).
2.  Klik tombol **Benarkan**.
3.  Konfirmasi aksi.
4.  Hasil: **Stok** bertambah kembali (+1) dan **Rusak** berkurang (-1).
