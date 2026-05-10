/**
 * AgroMarket — middlewares/errorHandler.js
 * Captura todos los errores no manejados y responde con formato uniforme.
 */

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url} →`, err.message);

  const status  = err.status || 500;
  const message = err.status ? err.message : "Error interno del servidor";

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;