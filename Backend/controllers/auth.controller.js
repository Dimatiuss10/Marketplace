
// Maneja la petición de login y responde.

const service = require("../services/auth.service");

const login = async (req, res, next) => {
  try {
    const result = await service.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

const requestReset = async (req, res, next) => {
  try {
    const result = await service.requestReset(req.body.email);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

const verifyCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const result = await service.verifyCode(email, code);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    const result = await service.resetPassword(email, code, newPassword);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

module.exports = { login, requestReset, verifyCode, resetPassword };