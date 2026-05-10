const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "dev_secret_inseguro";

// ── Verifica que el token exista y sea válido ──────────────────────────────────
const requireAuth = (req, res, next) => {
  const header = req.headers["authorization"];

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token requerido" });
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload; // { id, role, email }
    next();
  } catch (err) {
    const message = err.name === "TokenExpiredError"
      ? "La sesión ha expirado, vuelve a iniciar sesión"
      : "Token inválido";
    return res.status(401).json({ success: false, message });
  }
};

// ── Verifica que el usuario tenga uno de los roles permitidos ─────────────────
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "No tienes permisos para realizar esta acción",
    });
  }
  next();
};

module.exports = { requireAuth, requireRole };