const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { errorHandler } = require("../helpers/dbErrorHandling");

const Active = require("../models/active.model");
const Election = require("../models/elections/election.model");
const NominationPeriod = require("../models/nominations/nominationPeriod.model");

// Get All Actives Controller
exports.getAllActivesController = (req, res) => {
  Active.find((err, actives) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "No active nominations or elections found.",
      });
    }

    return res.json(actives);
  });
};

// Create Active Controller
exports.createActiveController = (req, res) => {
  const { refId, type } = req.body;
  const errors = validationResult(req);

  let newActive = new Active({ refId, type });

  // Validation for req.body
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      success: false,
      error: firstError,
    });
  } else if (type == "election") {
    Election.findOne({ _id: refId }, (err, election) => {
      if (err) {
        return res.status(422).json({
          success: false,
          error: "Election does not exist.",
        });
      }

      return newActive.save((err, active) => {
        if (err) {
          return res.status(400).json({
            success: false,
            error: errorHandler(err),
          });
        } else {
          return res.json({
            success: true,
            message: "Active creation successful.",
            active,
          });
        }
      });
    });
  } else if (type == "nomination") {
    NominationPeriod.findOne({ _id: refId }, (err, nomPeriod) => {
      if (err) {
        return res.status(422).json({
          success: false,
          error: "Nomination period does not exist.",
        });
      }

      return newActive.save((err, active) => {
        if (err) {
          return res.status(400).json({
            success: false,
            error: errorHandler(err),
          });
        } else {
          return res.json({
            success: true,
            message: "Active creation successful.",
            active,
          });
        }
      });
    });
  }
};

// Delete Active Controller
exports.deleteActiveController = (req, res) => {
  const refId = req.params.id;

  Active.findOneAndDelete({ refId }, (err, deletedActive) => {
    if (err || !deletedActive) {
      res.status(400).json({
        error: "Could not delete active.",
        success: false,
      });
    }

    res.json({ success: true, deletedActive });
  });
};
