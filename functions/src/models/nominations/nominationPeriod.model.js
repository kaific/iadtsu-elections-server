const mongoose = require("mongoose");

const NominationPeriodSchema = new mongoose.Schema(
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

module.exports = mongoose.model("NominationPeriod", NominationPeriodSchema);
