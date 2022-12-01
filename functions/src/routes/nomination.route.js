const express = require("express");
const router = express.Router();

// Validation
const {
  validNominee,
  validNomination,
  validNominationPeriod,
} = require("../helpers/valid");

// Load Controllers
const {
  requireSignin,
  adminMiddleware,
} = require("../controllers/auth.controller");
const {
  enterController,
  updateNomineeController,
  nominateController,
  getNomineesController,
  getNomineesByPeriodController,
  getNominationsController,
  getSigneeNominationsController,
  getNomineeSignaturesController,
  getMyNomineesController,
  getNominationPeriodsController,
  createNominationPeriodController,
  updateNominationPeriodController,
  deleteNomineeController,
} = require("../controllers/nomination.controller");

router.get("/nomination/nominees", getNomineesController);
router.post("/nomination/nominees", getNomineesByPeriodController);

router.post("/nomination/nominees/mine", getMyNomineesController); // redundant, change

router.get("/nomination/all", getNominationsController);

router.post("/nomination/signee/mine", getSigneeNominationsController);
router.post("/nomination/nominee/mine", getNomineeSignaturesController);

router.post("/nomination/enter", validNominee, enterController);
router.post("/nomination/nominate", validNomination, nominateController);

router.put(
  "/nomination/nominees/:id",
  /*validNominee,*/ updateNomineeController
);

router.get("/nomination/period", requireSignin, getNominationPeriodsController);
router.post(
  "/nomination/period",
  validNominationPeriod,
  requireSignin,
  adminMiddleware,
  createNominationPeriodController
);

router.put(
  "/nomination/period",
  validNominationPeriod,
  requireSignin,
  adminMiddleware,
  updateNominationPeriodController
);

router.delete(
  "/nomination/nominee/:id",
  requireSignin,
  adminMiddleware,
  deleteNomineeController
);

module.exports = router;
