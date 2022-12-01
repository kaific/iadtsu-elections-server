const mongoose = require("mongoose");
const { electionRoles } = require("../../helpers/constants");

const CandidateVotes = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    role: {
      type: String,
      enum: electionRoles,
      required: true,
    },
  },
  { timestamps: false, _id: false }
);

const ReopenNominations = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: electionRoles,
      required: true,
    },
  },
  { timestamps: false, _id: false }
);

const Referenda = new mongoose.Schema(
  {
    referendum: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    votedFor: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: false, _id: false }
);

const BallotSchema = new mongoose.Schema({
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Election",
    required: true,
  },
  candidateVotes: {
    type: [CandidateVotes],
  },

  reopenNominations: {
    type: [ReopenNominations],
  },
  referenda: {
    type: [Referenda],
  },
});

module.exports = mongoose.model("Ballot", BallotSchema);
