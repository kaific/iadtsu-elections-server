const express = require("express");
const router = express.Router();

// Validation
const {
  validCandidate,
  validReferendum,
  validElection,
  validBallot,
  validCandidates,
} = require("../helpers/valid");

// Load Controllers
const {
  requireSignin,
  adminMiddleware,
} = require("../controllers/auth.controller");

const {
  getAllElectionsController,
  createElectionController,
  getYearElectionsController,
  updateElectionController,
  getAllCandidatesController,
  getElectionCandidatesController,
  createCandidateController,
  createReferendumController,
  getElectionReferendaController,
  createBallotController,
  getElectionBallotsController,
  getMyVotesController,
  createCandidatesController,
  deleteCandidatesByElectionController,
  getElectionByIdController,
} = require("../controllers/election.controller");

const {
  createRaffleTicketController,
} = require("../controllers/raffle.controller");

router.get("/elections", getAllElectionsController);
router.post("/election/year", getYearElectionsController);
router.get("/election/:id", getElectionByIdController);

router.put("/election/:id", validElection, updateElectionController);

router.get("/election/candidates", getAllCandidatesController);
router.get("/election/:id/candidates", getElectionCandidatesController);

router.get(
  "/election/:id/referenda",
  validReferendum,
  getElectionReferendaController
);
router.post("/election/referenda", validReferendum, createReferendumController);

router.get("/election/:id/votes", getElectionBallotsController);
router.post("/election/vote", validBallot, createBallotController);
router.post("/election/votes/mine", getMyVotesController);

router.get("/election/:id/ballots", getElectionBallotsController);

// Admin Routes

// Create Election
router.post(
  "/election",
  validElection,
  requireSignin,
  adminMiddleware,
  createElectionController
);

// Create a Candidate
router.post(
  "/election/candidates",
  validCandidate,
  requireSignin,
  adminMiddleware,
  createCandidateController
);

// Create Multiple Candidates
router.post(
  "/election/candidates/multiple",
  validCandidates,
  requireSignin,
  adminMiddleware,
  createCandidatesController
);

router.delete("/election/:id/candidates", deleteCandidatesByElectionController);
router.post("/raffle/join", createRaffleTicketController);

module.exports = router;
