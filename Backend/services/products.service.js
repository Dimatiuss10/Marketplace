const db = require("../db");

// ── Validación ────────────────────────────────────────────────────────────────
function validate({ name, price, stock, region, user_id }) {
  const errors = [];
  if (!name   || name.trim().length < 2)       errors.push("name: mínimo 2 caracteres");
  if (!price  || isNaN(price) || price <= 0)   errors.push("price: debe ser un número mayor a 0");
  if (stock   === undefined || isNaN(stock) || stock < 0) errors.push("stock: debe ser un número mayor o igual a 0");
  if (!region || region.trim().length < 2)     errors.push("region: requerido");
  if (!user_id || isNaN(user_id))              errors.push("user_id: requerido");
  if (errors.length > 0) {
    const err = new Error(errors.join(" | "));
    err.status = 400;
    throw err;
  }
}

// ── Servicios ─────────────────────────────────────────────────────────────────
const getAll = async () => {
  const [rows] = await db.query(`
    SELECT p.*, u.name AS seller_name, u.region AS seller_region
    FROM products p
    INNER JOIN users u ON p.user_id = u.id
    ORDER BY p.id ASC
  `);
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.query(`
    SELECT p.*, u.name AS seller_name, u.region AS seller_region
    FROM products p
    INNER JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `, [id]);
  return rows[0] || null;
};

const getBySeller = async (user_id) => {
  const [rows] = await db.query(`
    SELECT p.*, u.name AS seller_name
    FROM products p
    INNER JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
    ORDER BY p.id ASC
  `, [user_id]);
  return rows;
};

const create = async (data) => {
  validate(data);

  const { name, description, price, stock, image_url, region, user_id } = data;

  // Verificar que el user_id existe y es Vendedor
  const [seller] = await db.query("SELECT id, role FROM users WHERE id = ?", [user_id]);
  if (seller.length === 0) {
    const err = new Error("El vendedor especificado no existe");
    err.status = 404;
    throw err;
  }
  if (seller[0].role !== "Vendedor") {
    const err = new Error("El usuario no tiene rol de Vendedor");
    err.status = 403;
    throw err;
  }

  const [result] = await db.query(
    "INSERT INTO products (name, description, price, stock, image_url, region, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name.trim(), description || null, price, stock, image_url || null, region.trim(), user_id]
  );

  return getById(result.insertId);
};

const update = async (id, data) => {
  const existing = await getById(id);
  if (!existing) return null;

  validate(data);

  const { name, description, price, stock, image_url, region, user_id } = data;

  // Verificar que el user_id existe y es Vendedor
  const [seller] = await db.query("SELECT id, role FROM users WHERE id = ?", [user_id]);
  if (seller.length === 0) {
    const err = new Error("El vendedor especificado no existe");
    err.status = 404;
    throw err;
  }
  if (seller[0].role !== "Vendedor") {
    const err = new Error("El usuario no tiene rol de Vendedor");
    err.status = 403;
    throw err;
  }

  await db.query(
    "UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image_url = ?, region = ?, user_id = ? WHERE id = ?",
    [name.trim(), description || null, price, stock, image_url || null, region.trim(), user_id, id]
  );

  return getById(id);
};

const remove = async (id) => {
  const product = await getById(id);
  if (!product) return null;
  await db.query("DELETE FROM products WHERE id = ?", [id]);
  return product;
};

module.exports = { getAll, getById, getBySeller, create, update, remove };