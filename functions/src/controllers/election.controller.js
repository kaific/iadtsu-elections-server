const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const { errorHandler } = require("../helpers/dbErrorHandling");
const { isEmpty } = require("../helpers/basic");
const Election = require("../models/elections/election.model");
const Candidate = require("../models/elections/candidate.model");
const Referendum = require("../models/elections/referendum.model");
const Ballot = require("../models/elections/ballot.model");
const Vote = require("../models/elections/vote.model");
const { json } = require("body-parser");

// Get All Elections
exports.getAllElectionsController = (req, res) => {
  /*
   verify user 
  */
  Election.find((err, elections) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "No elections found.",
      });
    }

    return res.json(elections);
  });
};

// Get Elections By Year
exports.getYearElectionsController = (req, res) => {
  /*
   verify user 
  */
  const { year } = req.body;

  if (!year) {
    return res.status(400).json({
      success: false,
      error: "Missing year value.",
    });
  }

  Election.find(
    {
      startDate: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1),
      },
    },
    (err, elections) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err,
        });
      }

      if (isEmpty(elections)) {
        return res.json({
          success: false,
          error: `No elections found for the year ${year}.`,
        });
      }

      return res.json(elections);
    }
  );
};

// Get Election by ID
exports.getElectionByIdController = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "Missing ID value.",
    });
  }

  Election.findOne(
    {
      _id: id,
    },
    (err, election) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err,
        });
      }

      if (!election) {
        return res.json({
          success: false,
          error: `No election found with ID.`,
        });
      }

      return res.json(election);
    }
  );
};

// Create an Election
exports.createElectionController = (req, res) => {
  const { startDate, endDate, byElection } = req.body;
  const errors = validationResult(req);

  // Validation for req.body
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      success: false,
      error: firstError,
    });
  } else {
    /* 
      verify user token
    */

    let newElection = new Election({
      startDate,
      endDate,
      byElection,
    });

    newElection.save((err, election) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: errorHandler(err),
        });
      } else {
        return res.json({
          success: true,
          message: "Election creation successful.",
          election,
        });
      }
    });
  }
};

// Update an Election
exports.updateElectionController = (req, res) => {
  /* 
    verify admin user
  */
  const { candidates, referenda, startDate, endDate, byElection } = req.body;
  const electionId = req.params.id;
  const errors = validationResult(req);

  // Validation for req.body
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      success: false,
      error: firstError,
    });
  } else {
    /* 
      verify user token
    */

    let newElection = {
      candidates,
      referenda,
      startDate,
      endDate,
      byElection,
    };

    Election.findByIdAndUpdate(
      electionId,
      newElection,
      { new: true },
      (err, election) => {
        if (err) {
          return res.status(400).json({
            success: false,
            error: errorHandler(err),
          });
        } else {
          return res.json({
            success: true,
            message: "Election modification successful.",
            election,
          });
        }
      }
    );
  }
};

// Get All Candidates
exports.getAllCandidatesController = (req, res) => {
  /*
   verify admin user 
  */
  Candidate.find((err, candidates) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "No candidates found.",
      });
    }

    return res.json(candidates);
  });
};

// Get Candidates By Election ID
exports.getElectionCandidatesController = (req, res) => {
  const electionId = req.params.id;

  Candidate.find({ election: electionId }, (err, candidates) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "No candidates found.",
      });
    }

    return res.json(candidates);
  })
    .populate("user", ["pref_first_name", "last_name", "student_number"])
    .populate("election")
    .exec();
};

// Create Candidate
exports.createCandidateController = (req, res) => {
  const { user, role, election } = req.body;
  const errors = validationResult(req);

  let newCandidate = new Candidate({
    user,
    role,
    election,
  });

  // Validation for req.body
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      success: false,
      error: firstError,
    });
  } else {
    /* 
      verify user token
    */

    Candidate.find({ user, role, election }, (err, c) => {
      if (!isEmpty(c)) {
        return res.status(400).json({
          success: false,
          error: "Candidate already exists.",
        });
      } else {
        newCandidate.save((err, candidate) => {
          if (err) {
            return res.status(400).json({
              success: false,
              error: errorHandler(err),
            });
          } else {
            return res.json({
              success: true,
              message: "Candidate creation successful.",
              candidate,
            });
          }
        });
      }
    });
  }
};

// Create Multiple Candidates
exports.createCandidatesController = (req, res) => {
  const { candidates, election } = req.body;
  const errors = validationResult(req);
  let users = [];

  candidates.map((c) => {
    users.push(c.user);
  });

  // Validation for req.body
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      success: false,
      error: firstError,
    });
  } else {
    Candidate.find({ user: { $in: users }, election: election }, (err, c) => {
      let newCandidates = [];
      if (!isEmpty(c)) {
        return res.status(400).json({
          success: false,
          error: "One or more candidates were already added to election.",
        });
      } else {
        Candidate.insertMany(candidates, (err, newCandidates) => {
          if (err) {
            console.log(err);
            return res.status(400).json({
              success: false,
              error: "Could not add candidates.",
            });
          } else {
            return res.json({
              success: true,
              message: "Candidates added to election successfully.",
              newCandidates,
            });
          }
        });
      }
    });
  }
};

// Delete Candidates by Election ID
exports.deleteCandidatesByElectionController = (req, res) => {
  const id = req.params.id;
  console.log(id);
  Candidate.deleteMany({ election: id }, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "Could not delete candidates.",
      });
    } else {
      return res.json({
        success: true,
        message: "Successfully deleted candidates for election.",
      });
    }
  });
};

// Get Referenda by Election ID
exports.getElectionReferendaController = (req, res) => {
  /*
  verify user
  */
  const electionId = req.params.id;

  Referendum.find({ election: electionId }, (err, referenda) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "No referenda found.",
      });
    }

    return res.json(referenda);
  }).populate("election");
};

// Create Referendum
exports.createReferendumController = (req, res) => {
  const { title, description, election } = req.body;
  const errors = validationResult(req);

  let newReferendum = new Referendum({
    title,
    description,
    election,
  });

  // Validation for req.body
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      success: false,
      error: firstError,
    });
  } else {
    /* 
      verify user token
    */
    newReferendum.save((err, referendum) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: errorHandler(err),
        });
      } else {
        return res.json({
          success: true,
          message: "Referendum creation successful.",
          referendum,
        });
      }
    });
  }
};

// Get Ballots by Election ID
exports.getElectionBallotsController = (req, res) => {
  /*
  verify admin user
  */
  const electionId = req.params.id;

  Ballot.find({ election: electionId }, (err, ballots) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "No ballots found.",
      });
    }

    return res.json(ballots);
  }).populate("election");
};

// Create Ballot
exports.createBallotController = (req, res) => {
  const {
    token,
    election,
    candidateVotes,
    reopenNominations,
    referenda,
  } = req.body;
  const errors = validationResult(req);

  let newBallot = new Ballot({
    election,
    candidateVotes,
    reopenNominations,
    referenda,
  });

  // record vote
  let newVote;
  let user;

  // Validation for req.body
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      success: false,
      error: firstError,
    });
  } else {
    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Unauthorised.",
      });
    }

    // Check if user has already voted
    Vote.find({ user: user._id, election }, (err, vote) => {
      if (!isEmpty(vote)) {
        return res.status(400).json({
          success: false,
          error: "You have already voted in this election.",
        });
      }

      newVote = new Vote({ user: user._id, election });

      newBallot.save(async (err, ballot) => {
        if (err) {
          return res.status(400).json({
            success: false,
            error: errorHandler(err),
          });
        } else {
          newVote.save().then((vote) => {
            return res.json({
              success: true,
              message: "Ballot creation successful.",
              ballot,
            });
          });
        }
      });
    });
  }
};

// Get User's Votes by Election ID
exports.getMyVotesController = (req, res) => {
  const { token, election } = req.body;
  const user = jwt.verify(token, process.env.JWT_SECRET);

  Vote.find({ user: user._id, election }, (err, votes) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: errorHandler(err),
      });
    } else {
      return res.json(votes);
    }
  });
};
