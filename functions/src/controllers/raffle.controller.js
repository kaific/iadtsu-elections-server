const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { errorHandler } = require("../helpers/dbErrorHandling");

const RaffleTicket = require("../models/elections/raffleTicket.model");

// Create Raffle Ticket
exports.createRaffleTicketController = (req, res) => {
  const { token } = req.body;
  let user = jwt.verify(token, process.env.JWT_SECRET);
  let newTicket = new RaffleTicket({ user });

  return newTicket.save((err, ticket) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: errorHandler(err),
      });
    } else {
      return res.json({
        success: true,
        message: "Raffle ticket successfully added.",
        ticket,
      });
    }
  });
};
