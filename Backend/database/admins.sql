-- AgroMarket — database/admins.sql
-- Ejecuta este script para agregar la tabla de admins.

USE agromarket;

CREATE TABLE IF NOT EXISTS admins (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Admin por defecto — contraseña se hashea con bcrypt al ejecutar:
--   node scripts/hash-admin-password.js
-- Este INSERT usa texto plano temporalmente; el script lo reemplaza por el hash.
INSERT INTO admins (name, email, password) VALUES
  ('Administrador', 'admin@agromarket.co', 'PENDIENTE_HASH')
ON DUPLICATE KEY UPDATE name = 'Administrador';