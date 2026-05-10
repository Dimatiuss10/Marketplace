const service = require("../services/products.service");

const getAll = async (req, res, next) => {
  try {
    const products = await service.getAll();
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const product = await service.getById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Producto no encontrado" });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const getBySeller = async (req, res, next) => {
  try {
    const products = await service.getBySeller(req.params.user_id);
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const newProduct = await service.create(req.body);
    res.status(201).json({ success: true, message: "Producto creado exitosamente", data: newProduct });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const updated = await service.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: "Producto no encontrado" });
    res.json({ success: true, message: "Producto actualizado", data: updated });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const deleted = await service.remove(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Producto no encontrado" });
    res.json({ success: true, message: "Producto eliminado", data: deleted });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, getBySeller, create, update, remove };