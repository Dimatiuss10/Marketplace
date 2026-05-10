-- AgroMarket — database/schema.sql
-- Ejecuta este script en MySQL para crear la base de datos y tablas.

CREATE DATABASE IF NOT EXISTS agromarket
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE agromarket;

CREATE TABLE IF NOT EXISTS users (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  role       ENUM('Vendedor', 'Comprador') NOT NULL,
  region     VARCHAR(100) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Datos de ejemplo
-- INSERT INTO users (name, email, role, region, password) VALUES
--   ('Carlos Mendoza', 'carlos@agromarket.co', 'Vendedor',  'Cundinamarca', 'Carlos Mendoza'),
--   ('Luisa Fernanda', 'luisa@agromarket.co',  'Comprador', 'Antioquia',    'Luisa Fernanda'),
--   ('Pedro Aguilar',  'pedro@agromarket.co',  'Vendedor',  'Valle',        'Pedro Aguilar');