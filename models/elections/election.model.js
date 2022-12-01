const mongoose = require("mongoose");

const ElectionSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    byElection: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Election", ElectionSchema);
