-- MySQL Database Schema for SKL App
-- Run this to create the table

CREATE DATABASE IF NOT EXISTS skl_db;
USE skl_db;

CREATE TABLE skl (
  id INT PRIMARY KEY AUTO_INCREMENT,
  jurusan VARCHAR(255) NOT NULL,
  prodi VARCHAR(255) NOT NULL,
  nomor_surat VARCHAR(100) NOT NULL,
  nama VARCHAR(255) NOT NULL,
  nim VARCHAR(50) UNIQUE NOT NULL,
  tempat_lahir VARCHAR(255) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  tanggal_lulus DATE NOT NULL,
  judul_ta TEXT NOT NULL,
  nin VARCHAR(100),
  nomor_transkrip VARCHAR(100),
  ipk DECIMAL(3,2) CHECK (ipk BETWEEN 0.00 AND 4.00) NOT NULL,
  predikat VARCHAR(100) NOT NULL,
  tanggal_pembuatan DATE NOT NULL,
  is_printed BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_nim ON skl(nim);
CREATE INDEX idx_nama ON skl(nama);
CREATE INDEX idx_nomorsurat ON skl(nomor_surat);
CREATE INDEX idx_isdeleted ON skl(is_deleted);

-- Insert sample data
INSERT INTO skl (jurusan, prodi, nomor_surat, nama, nim, tempat_lahir, tanggal_lahir, tanggal_lulus, judul_ta, nin, nomor_transkrip, ipk, predikat, tanggal_pembuatan) VALUES
('Ilmu Ekonomi dan Studi Pembangunan', 'S1 Ekonomi Pembangunan', 'SKL/001/2024', 'Ahmad Santoso', '2021001', 'Jakarta', '1999-05-15', '2024-06-30', 'Pengaruh Kebijakan Moneter terhadap Pertumbuhan Ekonomi', 'NIN123456', 'TR/001/2024', 3.85, 'Sangat Memuaskan', '2024-09-10');