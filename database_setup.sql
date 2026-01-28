-- Roles
CREATE TABLE roles (
    id_role SERIAL PRIMARY KEY,
    nama_role VARCHAR(50) NOT NULL
);

-- Users
CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    id_role INT NOT NULL,
    status VARCHAR(10) DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_role) REFERENCES roles(id_role)
);

-- Kategori
CREATE TABLE kategori (
    id_kategori SERIAL PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL
);

-- Alat
CREATE TABLE alat (
    id_alat SERIAL PRIMARY KEY,
    nama_alat VARCHAR(100) NOT NULL,
    id_kategori INT NOT NULL,
    stok INT NOT NULL,
    kondisi VARCHAR(10) DEFAULT 'baik',
    FOREIGN KEY (id_kategori) REFERENCES kategori(id_kategori)
);

-- Peminjaman
CREATE TABLE peminjaman (
    id_pinjam SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    id_alat INT NOT NULL,
    tanggal_pinjam DATE NOT NULL,
    tanggal_kembali DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pengajuan',
    FOREIGN KEY (id_user) REFERENCES users(id_user),
    FOREIGN KEY (id_alat) REFERENCES alat(id_alat)
);

-- Pengembalian
CREATE TABLE pengembalian (
    id_kembali SERIAL PRIMARY KEY,
    id_pinjam INT NOT NULL,
    tanggal_dikembalikan DATE NOT NULL,
    denda INT DEFAULT 0,
    FOREIGN KEY (id_pinjam) REFERENCES peminjaman(id_pinjam)
);

-- Log Aktivitas
CREATE TABLE log_aktivitas (
    id_log SERIAL PRIMARY KEY,
    id_user INT,
    aktivitas TEXT,
    waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id_user)
);

-- FUNCTION (PostgreSQL Version)
CREATE OR REPLACE FUNCTION hitung_denda(tgl_kembali DATE, tgl_dikembalikan DATE)
RETURNS INT AS $$
DECLARE
    selisih INT;
BEGIN
    selisih := tgl_dikembalikan - tgl_kembali;

    IF selisih > 0 THEN
        RETURN selisih * 1000;
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER — Kurangi Stok Saat Disetujui
CREATE OR REPLACE FUNCTION kurangi_stok_fungsi()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'disetujui' THEN
        UPDATE alat
        SET stok = stok - 1
        WHERE id_alat = NEW.id_alat;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kurangi_stok
AFTER UPDATE ON peminjaman
FOR EACH ROW
EXECUTE FUNCTION kurangi_stok_fungsi();

-- TRIGGER — Tambah Stok Saat Dikembalikan
CREATE OR REPLACE FUNCTION tambah_stok_fungsi()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE alat
    SET stok = stok + 1
    WHERE id_alat = (
        SELECT id_alat FROM peminjaman WHERE id_pinjam = NEW.id_pinjam
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tambah_stok
AFTER INSERT ON pengembalian
FOR EACH ROW
EXECUTE FUNCTION tambah_stok_fungsi();

-- TRANSACTION PostgreSQL Sample
-- BEGIN;
-- INSERT INTO kategori (nama_kategori) VALUES ('Elektronik');
-- INSERT INTO alat (nama_alat, id_kategori, stok) VALUES ('Proyektor', 1, 5);
-- COMMIT;
-- Rollback jika gagal:
-- ROLLBACK;
