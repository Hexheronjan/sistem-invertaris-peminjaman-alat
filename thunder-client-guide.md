# Panduan Testing API dengan Thunder Client

Pastikan server berjalan: `npm run dev` (localhost:3000).
Jalankan request berikut secara berurutan.

## 1. Buat User Admin Pertama (Register)
Karena database masih kosong dari user, buat dulu user admin.
*   **Method**: `POST`
*   **URL**: `http://localhost:3000/api/users`
*   **Body (JSON)**:
    ```json
    {
      "nama": "Super Admin",
      "username": "admin",
      "password": "password123",
      "id_role": 1,
      "status": "aktif"
    }
    ```

## 2. Login Admin
*   **Method**: `POST`
*   **URL**: `http://localhost:3000/api/auth/login`
*   **Body (JSON)**:
    ```json
    {
      "username": "admin",
      "password": "password123"
    }
    ```
*   **Penting**: Setelah ini Thunder Client dlm VSCode biasanya otomatis menyimpan Cookie. Jadi request selanjutnya otomatis ter-autentikasi.

## 3. Cek Data Alat
*   **Method**: `GET`
*   **URL**: `http://localhost:3000/api/alat`
*   **Response**: Harusnya muncul alat "Proyektor" (id_alat: 1) dengan stok 5.

## 4. Buat User Peminjam
*   **Method**: `POST`
*   **URL**: `http://localhost:3000/api/users`
*   **Body (JSON)**:
    ```json
    {
      "nama": "Budi Santoso",
      "username": "budi",
      "password": "budi123",
      "id_role": 3,
      "status": "aktif"
    }
    ```
*   **Note**: Perhatikan `id_user` yang muncul di response (misal: 2). Gunakan ID ini untuk meminjam.

## 5. Ajukan Peminjaman
*   **Method**: `POST`
*   **URL**: `http://localhost:3000/api/peminjaman`
*   **Body (JSON)**:
    ```json
    {
      "id_user": 2,
      "id_alat": 1,
      "tanggal_pinjam": "2025-01-01",
      "tanggal_kembali": "2025-01-03"
    }
    ```
*   **Note**: Ingat `id_pinjam` yang muncul di response (misal: 1).

## 6. Setujui Peminjaman (Petugas/Admin)
*   **Method**: `PUT`
*   **URL**: `http://localhost:3000/api/peminjaman/1`
*   **Body (JSON)**:
    ```json
    {
      "status": "disetujui"
    }
    ```
*   **Cek**: Setelah ini, coba GET Alat lagi. Stok harusnya berkurang jadi 4.

## 7. Kembalikan Alat
*   **Method**: `POST`
*   **URL**: `http://localhost:3000/api/pengembalian`
*   **Body (JSON)**:
    ```json
    {
      "id_pinjam": 1,
      "tanggal_dikembalikan": "2025-01-05"
    }
    ```
*   **Hasil**: Karena janji kembali tgl 3 tapi dikembalikan tgl 5, harusnya ada **Denda** (2 hari x 1000 = 2000). Cek response JSON bagian `denda`.
