const db   = require("../db");
const bcrypt = require("bcrypt");
const jwt    = require("jsonwebtoken");
const { sendResetCode } = require("./mail.service");

const SECRET     = process.env.JWT_SECRET    || "dev_secret_inseguro";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

const login = async ({ email, password }) => {
  if (!email || !password) {
    const err = new Error("Email y contrasena son requeridos");
    err.status = 400;
    throw err;
  }

  const emailNorm = email.trim().toLowerCase();

  const [admins] = await db.query(
    "SELECT id, name, email, password FROM admins WHERE email = ?",
    [emailNorm]
  );
  if (admins.length > 0) {
    const match = await bcrypt.compare(password, admins[0].password);
    if (!match) {
      const err = new Error("Credenciales incorrectas");
      err.status = 401;
      throw err;
    }
    const { password: _, ...adminData } = admins[0];
    const token = jwt.sign(
      { id: adminData.id, role: "admin", email: adminData.email },
      SECRET,
      { expiresIn: EXPIRES_IN }
    );
    return { role: "admin", user: adminData, token };
  }

  const [users] = await db.query(
    "SELECT id, name, email, role, region, password FROM users WHERE email = ?",
    [emailNorm]
  );
  if (users.length > 0) {
    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const err = new Error("Credenciales incorrectas");
      err.status = 401;
      throw err;
    }
    const { password: _, ...userData } = user;
    const token = jwt.sign(
      { id: userData.id, role: userData.role, email: userData.email },
      SECRET,
      { expiresIn: EXPIRES_IN }
    );
    return { role: user.role, user: userData, token };
  }

  const err = new Error("Credenciales incorrectas");
  err.status = 401;
  throw err;
};

// ── Solicitar codigo ──────────────────────────────────────────────
const requestReset = async (email) => {
  if (!email) {
    const err = new Error("Email requerido");
    err.status = 400;
    throw err;
  }

  const emailNorm = email.trim().toLowerCase();

  // Verificar que el email existe en users o admins
  const [users]  = await db.query("SELECT id FROM users  WHERE email = ?", [emailNorm]);
  const [admins] = await db.query("SELECT id FROM admins WHERE email = ?", [emailNorm]);

  if (users.length === 0 && admins.length === 0) {
    const err = new Error("No existe una cuenta con ese correo");
    err.status = 404;
    throw err;
  }

  // Invalidar codigos anteriores
  await db.query("UPDATE reset_codes SET used = 1 WHERE email = ?", [emailNorm]);

  // Generar codigo de 6 digitos
  const code      = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

  await db.query(
    "INSERT INTO reset_codes (email, code, expires_at) VALUES (?, ?, ?)",
    [emailNorm, code, expiresAt]
  );

  await sendResetCode(emailNorm, code);

  return { message: "Codigo enviado al correo" };
};

// ── Verificar codigo ──────────────────────────────────────────────
const verifyCode = async (email, code) => {
  if (!email || !code) {
    const err = new Error("Email y codigo son requeridos");
    err.status = 400;
    throw err;
  }

  const emailNorm = email.trim().toLowerCase();

  const [rows] = await db.query(
    "SELECT * FROM reset_codes WHERE email = ? AND code = ? AND used = 0 ORDER BY created_at DESC LIMIT 1",
    [emailNorm, code]
  );

  if (rows.length === 0) {
    const err = new Error("Codigo invalido");
    err.status = 400;
    throw err;
  }

  if (new Date() > new Date(rows[0].expires_at)) {
    const err = new Error("El codigo ha expirado");
    err.status = 400;
    throw err;
  }

  return { valid: true };
};

// ── Restablecer contraseña ────────────────────────────────────────
const resetPassword = async (email, code, newPassword) => {
  if (!newPassword || newPassword.length < 4) {
    const err = new Error("La contraseña debe tener minimo 4 caracteres");
    err.status = 400;
    throw err;
  }

  // Verificar codigo una vez mas
  await verifyCode(email, code);

  const emailNorm  = email.trim().toLowerCase();
  const hashed     = await bcrypt.hash(newPassword, 10);

  // Actualizar en users o admins segun corresponda
  const [users] = await db.query("SELECT id FROM users WHERE email = ?", [emailNorm]);
  if (users.length > 0) {
    await db.query("UPDATE users SET password = ? WHERE email = ?", [hashed, emailNorm]);
  } else {
    await db.query("UPDATE admins SET password = ? WHERE email = ?", [hashed, emailNorm]);
  }

  // Marcar codigo como usado
  await db.query("UPDATE reset_codes SET used = 1 WHERE email = ? AND code = ?", [emailNorm, code]);

  return { message: "Contraseña actualizada correctamente" };
};

module.exports = { login, requestReset, verifyCode, resetPassword };