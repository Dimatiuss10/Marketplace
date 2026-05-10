const service = require("../services/orders.service");

const create = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const { items } = req.body;
    const result = await service.create(buyerId, items);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const result = await service.getByBuyer(req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getSellerOrders = async (req, res, next) => {
  try {
    const result = await service.getBySeller(req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const result = await service.updateStatus(
      req.params.id,
      req.user.id,
      req.body.status
    );
    res.json({ success: true, data: result });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

const returnOrder = async (req, res, next) => {
  try {
    const result = await service.returnOrder(req.params.id, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

const rate = async (req, res, next) => {
  try {
    const { sellerId, score, comment } = req.body;
    const result = await service.rate(
      req.params.id,
      req.user.id,
      sellerId,
      score,
      comment
    );
    res.json({ success: true, data: result });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

module.exports = { create, getMyOrders, getSellerOrders, updateStatus, returnOrder, rate };