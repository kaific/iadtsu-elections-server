const mongoose = require("mongoose");

const NominationSchema = new mongoose.Schema(
  {
    signature: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nominee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nominee",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Nomination", NominationSchema);
