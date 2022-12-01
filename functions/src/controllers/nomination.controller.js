const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { errorHandler } = require("../helpers/dbErrorHandling");

const NominationPeriod = require("../models/nominations/nominationPeriod.model");
const Nominee = require("../models/nominations/nominee.model");
const Nomination = require("../models/nominations/nomination.model");

// Get All Nomination Periods
exports.getNominationPeriodsController = (req, res) => {
  NominationPeriod.find((err, nomPeriods) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "No nomination periods found.",
      });
    }

    return res.json(nomPeriods);
  });
};

// Create a Nomination Period
exports.createNominationPeriodController = (req, res) => {
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
    let newNominationPeriod = new NominationPeriod({
      startDate,
      endDate,
      byElection,
    });

    newNominationPeriod.save((err, nomPeriod) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: errorHandler(err),
        });
      } else {
        return res.json({
          success: true,
          message: "Nomination period creation successful.",
          nomPeriod,
        });
      }
    });
  }
};

// Update a Nomination Period
exports.updateNominationPeriodController = (req, res) => {
  /* 
    verify admin user
  */
  const { startDate, endDate, byElection } = req.body;
  const nominationPeriodId = req.params.id;
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

    let newNominationPeriod = {
      startDate,
      endDate,
      byElection,
    };

    NominationPeriod.findByIdAndUpdate(
      nominationPeriodId,
      newNominationPeriod,
      { new: true },
      (err, nomPeriod) => {
        if (err) {
          return res.status(400).json({
            success: false,
            error: errorHandler(err),
          });
        } else {
          return res.json({
            success: true,
            message: "Nomination period modification successful.",
            nomPeriod,
          });
        }
      }
    );
  }
};

// Nominee Enter Controller
exports.enterController = (req, res) => {
  const { role, token } = req.body;
  const year = 2021;
  const byElection = false;
  const errors = validationResult(req);

  // Validation for req.body
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      success: false,
      error: firstError,
    });
  } else {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (token && user) {
      let newNominee = new Nominee({
        user: user._id,
        role,
        year,
        byElection,
      });

      newNominee.save((err, nominee) => {
        if (err) {
          return res.status(400).json({
            success: false,
            error: errorHandler(err),
          });
        } else {
          return res.json({
            success: true,
            message: "Nominee listing successful.",
            nominee: nominee,
          });
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Unauthorised.",
      });
    }
  }
};

// Update Nominee Controller
exports.updateNomineeController = (req, res) => {
  const errors = validationResult(req);
  const { user, role, election } = req.body;

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      success: false,
      error: firstError,
    });
  } else {
    Nominee.findOne({ _id: req.params.id }, (err, nominee) => {
      if (err || !nominee) {
        return res.status(400).json({
          error: "Nominee not found",
          success: false,
        });
      }

      nominee.user = user;
      nominee.role = role;
      nominee.election = election;

      nominee.save((err, updatedNominee) => {
        if (err) {
          console.log("NOMINEE UPDATE ERROR", err);
          return res.status(400).json({
            error: "Nominee update failed",
            success: false,
          });
        }

        res.json({ success: true, nominee: updatedNominee });
      });
    });
  }
};

// Delete Nominee Controller
exports.deleteNomineeController = (req, res) => {
  const id = req.params.id;
  Nominee.findOneAndDelete({ _id: id }, (err, deletedNominee) => {
    if (err || !deletedNominee) {
      res.status(400).json({
        error: "Could not delete nominee.",
        success: false,
      });
    }

    res.json({ success: true, deletedNominee });
  });
};

// Nominate Controller
exports.nominateController = (req, res) => {
  const { nominee, token } = req.body;
  const errors = validationResult(req);

  // Validation for req.body
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      success: false,
      error: firstError,
    });
  } else {
    // Check if person nominating is a valid user
    let signee;
    try {
      signee = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Unauthorised.",
      });
    }
    // Check if nominee exists
    Nominee.findOne({ _id: nominee }, (err, nom) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Nominee does not exist.",
        });
      }

      // Check if nominating self - cannot use strict operator
      if (nom.user == signee._id) {
        return res.status(400).json({
          success: false,
          message: "Cannot nominate self.",
        });
      } else {
        // Check if nominee has not nominated same nominee
        Nomination.findOne({ signature: signee._id, nominee: nominee }).exec(
          (err, nomination) => {
            if (nomination) {
              return res.status(400).json({
                success: false,
                message: "Nomination already exists.",
              });
            } else {
              const nomination = new Nomination({
                signature: signee._id,
                nominee: nominee,
              });

              nomination.save((err, nomination) => {
                if (err) {
                  return res.status(400).json({
                    success: false,
                    error: errorHandler(err),
                  });
                } else {
                  return res.json({
                    success: true,
                    message: "Nomination successful.",
                  });
                }
              });
            }
          }
        );
      }
    });
  }
};

// Get Nominees Controller
exports.getNomineesController = (req, res) => {
  Nominee.find((err, nominees) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "No nominees found.",
      });
    }

    return res.json(nominees);
  }).populate("user", [
    "role",
    "first_name",
    "pref_first_name",
    "last_name",
    "student_number",
  ]);
};

exports.getNomineesByPeriodController = async (req, res) => {
  const { nominationPeriod } = req.body;

  // CHANGE !!! hardcoded byElection value

  Nominee.find(
    {
      nominationPeriod,
    },
    (err, nominees) => {
      if (err || !nominees) {
        return res.status(400).json({
          error: "No nominees found for nomination period.",
          success: false,
        });
      }

      return res.json(nominees);
    }
  ).populate("user", [
    "role",
    "first_name",
    "pref_first_name",
    "last_name",
    "student_number",
  ]);
};

// Get Nominations Controller
exports.getNominationsController = (req, res) => {
  Nomination.find((err, nominations) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "No nominations found.",
      });
    }

    return res.json(nominations);
  })
    .populate("signature", [
      "role",
      "first_name",
      "pref_first_name",
      "last_name",
      "student_number",
    ])
    .populate("nominee");
};

// Get User's Signed Nominations Controller
exports.getSigneeNominationsController = (req, res) => {
  const { token } = req.body;
  const signature = jwt.verify(token, process.env.JWT_SECRET);

  Nomination.find({ signature: signature._id }, (err, nominations) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "No nominations found",
      });
    }

    return res.json(nominations);
  })
    .populate("signature", [
      "role",
      "first_name",
      "pref_first_name",
      "last_name",
      "student_number",
    ])
    .populate("nominee");
};

// Get Nominee's Signatures Controller
exports.getNomineeSignaturesController = (req, res) => {
  const { token } = req.body;
  const user = jwt.verify(token, process.env.JWT_SECRET);

  Nominee.findOne({ user: user._id })
    .then((nominee) => {
      Nomination.find({ nominee: nominee._id }, (err, nominations) => {
        if (err) {
          return res.status(400).json({
            success: false,
            error: "No nominations found.",
          });
        }

        return res.json(nominations);
      }).populate("signature", [
        "pref_first_name",
        "last_name",
        "student_number",
      ]);
    })
    .catch((err) => {
      return res.status(400).json({
        success: false,
        error: errorHandler(err),
      });
    });
};

// Get User's Nominee Entries Controller - redundant, change to use regular nominees controller
exports.getMyNomineesController = (req, res) => {
  const { token } = req.body;
  const user = jwt.verify(token, process.env.JWT_SECRET);

  Nominee.find({ user: user._id }, (err, nominees) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: "No nominees found.",
      });
    }

    return res.json(nominees);
  }).populate("user", [
    "role",
    "first_name",
    "pref_first_name",
    "last_name",
    "student_number",
  ]);
};
