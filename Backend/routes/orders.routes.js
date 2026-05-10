const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/orders.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");

// Comprador
router.post(  "/",                requireAuth, requireRole("Comprador"), controller.create);
router.get(   "/my",              requireAuth, requireRole("Comprador"), controller.getMyOrders);
router.put(   "/:id/return",      requireAuth, requireRole("Comprador"), controller.returnOrder);
router.post(  "/:id/rate",        requireAuth, requireRole("Comprador"), controller.rate);

// Vendedor
router.get(   "/seller",          requireAuth, requireRole("Vendedor"),  controller.getSellerOrders);
router.put(   "/:id/status",      requireAuth, requireRole("Vendedor"),  controller.updateStatus);

module.exports = router;