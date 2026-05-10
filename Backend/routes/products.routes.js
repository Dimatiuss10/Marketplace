const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/products.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");

// Lectura pública — cualquiera puede ver el catálogo
router.get("/",                controller.getAll);
router.get("/seller/:user_id", controller.getBySeller);
router.get("/:id",             controller.getById);

// Escritura protegida — Vendedor o admin
router.post(  "/",    requireAuth, requireRole("Vendedor", "admin"), controller.create);
router.put(   "/:id", requireAuth, requireRole("Vendedor", "admin"), controller.update);
router.delete("/:id", requireAuth, requireRole("Vendedor", "admin"), controller.remove);

module.exports = router;