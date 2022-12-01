const express = require("express");
const router = express.Router();

// Validation
const { validActive } = require("../helpers/valid");

// Load Controllers
const {
  requireSignin,
  adminMiddleware,
} = require("../controllers/auth.controller");
const {
  getAllActivesController,
  createActiveController,
  deleteActiveController,
} = require("../controllers/active.controller");

router.get("/active", getAllActivesController);
router.post("/active", requireSignin, adminMiddleware, createActiveController);
router.delete(
  "/active/:id",
  requireSignin,
  adminMiddleware,
  deleteActiveController
);

module.exports = router;
