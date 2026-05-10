-- AgroMarket — database/products.sql
-- Ejecuta este script para agregar la tabla de productos.

USE agromarket;

CREATE TABLE IF NOT EXISTS products (
  id          INT            AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150)   NOT NULL,
  description TEXT,
  price       DECIMAL(10, 2) NOT NULL,
  stock       INT            NOT NULL DEFAULT 0,
  image_url   VARCHAR(500),
  region      VARCHAR(100)   NOT NULL,
  user_id     INT            NOT NULL,
  created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_product_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

-- Datos de ejemplo
-- INSERT INTO products (name, description, price, stock, image_url, region, user_id) VALUES
--   ('Tomate Chonto',   'Tomate fresco de cosecha propia, ideal para ensaladas.',  3500.00, 200, NULL, 'Cundinamarca', 1),
--   ('Papa Pastusa',    'Papa de primera calidad, recién cosechada.',               2800.00, 500, NULL, 'Cundinamarca', 1),
--   ('Aguacate Hass',   'Aguacate maduro, cremoso y de excelente sabor.',           4500.00, 150, NULL, 'Valle',        2);