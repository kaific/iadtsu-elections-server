const mongoose = require("mongoose");

const nomineeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: [
        "president",
        "welfare",
        "education",
        "lgbtq",
        "disability",
        "mature",
        "ents",
        "gaeilge",
        "socs",
      ],
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    byElection: {
      type: Boolean,
      required: true,
    },
    nominationPeriod: {
      type: mongoose.Schema.Types.ObjectId,
      Ref: "NominationPeriod",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Nominee", nomineeSchema);
