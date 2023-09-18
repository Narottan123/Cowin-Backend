const mongoose = require("mongoose");

const vaccineSlotSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["firstDose", "secondDose"],
      required: true,
    },
    availableDoses: {
      type: Number,
      required: true,
    },
    doseNumber: {
      type: Number,
      enum: [1, 2],
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("vaccineslot", vaccineSlotSchema);
