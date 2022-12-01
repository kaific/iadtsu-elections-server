const mongoose = require("mongoose");
const { activeTypes } = require("../helpers/constants");

const ActiveSchema = new mongoose.Schema(
  {
    refId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: activeTypes,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Active", ActiveSchema);
