const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/users.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");

// Solo admins pueden gestionar usuarios
router.get(   "/",    requireAuth, requireRole("admin"), controller.getAll);
router.get(   "/:id", requireAuth, requireRole("admin"), controller.getById);
router.post(  "/",    controller.create);
router.put(   "/:id", requireAuth, requireRole("admin"), controller.update);
router.delete("/:id", requireAuth, requireRole("admin"), controller.remove);

module.exports = router;