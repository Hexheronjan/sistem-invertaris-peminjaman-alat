-- CreateTable
CREATE TABLE "roles" (
    "id_role" SERIAL NOT NULL,
    "nama_role" VARCHAR(50) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "id_role" INTEGER NOT NULL,
    "status" VARCHAR(10) NOT NULL DEFAULT 'aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "kategori" (
    "id_kategori" SERIAL NOT NULL,
    "nama_kategori" VARCHAR(100) NOT NULL,

    CONSTRAINT "kategori_pkey" PRIMARY KEY ("id_kategori")
);

-- CreateTable
CREATE TABLE "alat" (
    "id_alat" SERIAL NOT NULL,
    "nama_alat" VARCHAR(100) NOT NULL,
    "id_kategori" INTEGER NOT NULL,
    "stok" INTEGER NOT NULL,
    "kondisi" VARCHAR(10) NOT NULL DEFAULT 'baik',

    CONSTRAINT "alat_pkey" PRIMARY KEY ("id_alat")
);

-- CreateTable
CREATE TABLE "peminjaman" (
    "id_pinjam" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_alat" INTEGER NOT NULL,
    "tanggal_pinjam" DATE NOT NULL,
    "tanggal_kembali" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pengajuan',

    CONSTRAINT "peminjaman_pkey" PRIMARY KEY ("id_pinjam")
);

-- CreateTable
CREATE TABLE "pengembalian" (
    "id_kembali" SERIAL NOT NULL,
    "id_pinjam" INTEGER NOT NULL,
    "tanggal_dikembalikan" DATE NOT NULL,
    "denda" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "pengembalian_pkey" PRIMARY KEY ("id_kembali")
);

-- CreateTable
CREATE TABLE "log_aktivitas" (
    "id_log" SERIAL NOT NULL,
    "id_user" INTEGER,
    "aktivitas" TEXT NOT NULL,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_aktivitas_pkey" PRIMARY KEY ("id_log")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "roles"("id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alat" ADD CONSTRAINT "alat_id_kategori_fkey" FOREIGN KEY ("id_kategori") REFERENCES "kategori"("id_kategori") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peminjaman" ADD CONSTRAINT "peminjaman_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peminjaman" ADD CONSTRAINT "peminjaman_id_alat_fkey" FOREIGN KEY ("id_alat") REFERENCES "alat"("id_alat") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengembalian" ADD CONSTRAINT "pengembalian_id_pinjam_fkey" FOREIGN KEY ("id_pinjam") REFERENCES "peminjaman"("id_pinjam") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_aktivitas" ADD CONSTRAINT "log_aktivitas_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;
