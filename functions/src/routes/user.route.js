const express = require("express");
const router = express.Router();

// import controller
const {
  requireSignin,
  adminMiddleware,
} = require("../controllers/auth.controller");
const {
  readController,
  updateController,
  readAllController,
  readPendingController,
  // deleteController,
  // deleteAllController,
} = require("../controllers/user.controller");

router.get("/user/:id", requireSignin, readController);
router.put("/user/update", requireSignin, updateController);
router.get("/admin/users", requireSignin, adminMiddleware, readAllController);
router.put("/admin/update", requireSignin, adminMiddleware, updateController);
router.get(
  "/admin/pending",
  requireSignin,
  adminMiddleware,
  readPendingController
);
// router.delete("/user/delete/:id", deleteController);
// router.delete("/user/deleteAll", deleteAllController);

module.exports = router;
