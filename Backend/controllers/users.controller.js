/**
 * Recibe las peticiones HTTP, llama al servicio y responde.
 */

const service = require("../services/users.service");

const getAll = async (req, res, next) => {
  try {
    const users = await service.getAll();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const user = await service.getById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const newUser = await service.create(req.body);
    res.status(201).json({ success: true, message: "Usuario creado exitosamente", data: newUser });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const updated = await service.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    res.json({ success: true, message: "Usuario actualizado", data: updated });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const deleted = await service.remove(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    res.json({ success: true, message: "Usuario eliminado", data: deleted });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };