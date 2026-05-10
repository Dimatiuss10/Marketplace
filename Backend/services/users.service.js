const db     = require("../db");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

// ── Validación ────────────────────────────────────────────────────────────────
function validate({ name, email, role, region, password }) {
  const errors = [];
  if (!name  || name.trim().length  < 2)                      errors.push("name: mínimo 2 caracteres");
  if (!email || !email.includes("@"))                         errors.push("email: formato inválido");
  if (!role  || !["Vendedor", "Comprador"].includes(role))    errors.push("role: debe ser 'Vendedor' o 'Comprador'");
  if (!region || region.trim().length < 2)                    errors.push("region: requerido");
  if (!password || password.length < 4)                       errors.push("password: mínimo 4 caracteres");
  if (errors.length > 0) {
    const err = new Error(errors.join(" | "));
    err.status = 400;
    throw err;
  }
}

// ── Servicios ─────────────────────────────────────────────────────────────────
const getAll = async () => {
  const [rows] = await db.query("SELECT id, name, email, role, region, created_at FROM users ORDER BY id ASC");
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.query("SELECT id, name, email, role, region, created_at FROM users WHERE id = ?", [id]);
  return rows[0] || null;
};

const create = async (data) => {
  validate(data);

  const { name, email, role, region, password } = data;
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Verificar email duplicado
  const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email.trim().toLowerCase()]);
  if (existing.length > 0) {
    const err = new Error("El email ya está registrado");
    err.status = 409;
    throw err;
  }

  const [result] = await db.query(
    "INSERT INTO users (name, email, role, region, password) VALUES (?, ?, ?, ?, ?)",
    [name.trim(), email.trim().toLowerCase(), role, region.trim(), hashedPassword]
  );

  return getById(result.insertId);
};

const update = async (id, data) => {
  const existing = await getById(id);
  if (!existing) return null;

  validate(data);

  const { name, email, role, region } = data;

  // Verificar email duplicado (excluyendo el usuario actual)
  const [dup] = await db.query("SELECT id FROM users WHERE email = ? AND id != ?", [email.trim().toLowerCase(), id]);
  if (dup.length > 0) {
    const err = new Error("El email ya está registrado");
    err.status = 409;
    throw err;
  }

  await db.query(
    "UPDATE users SET name = ?, email = ?, role = ?, region = ? WHERE id = ?",
    [name.trim(), email.trim().toLowerCase(), role, region.trim(), id]
  );

  return getById(id);
};

const remove = async (id) => {
  const user = await getById(id);
  if (!user) return null;
  await db.query("DELETE FROM users WHERE id = ?", [id]);
  return user;
};

module.exports = { getAll, getById, create, update, remove };