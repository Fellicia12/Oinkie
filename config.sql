CREATE DATABASE IF NOT EXISTS oinkie_db;
USE oinkie_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS barang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_barang VARCHAR(100) NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    status ENUM('hilang', 'ditemukan') NOT NULL,
    lokasi VARCHAR(100) NOT NULL,
    tanggal DATE NOT NULL,
    deskripsi TEXT,
    foto VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pengguna Default (Username: nis12345, Password: 123)
INSERT INTO users (username, password, nama_lengkap) 
VALUES ('nis12345', '$2y$10$E24o1G7U1B8p5.2d5e3N4eR8oZ1L2m3N4o5P6q7R8s9T0u1V2W3X4', 'Budi Santoso');