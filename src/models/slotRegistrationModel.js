const mongoose = require("mongoose");

const slotRegistration = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    doseNumber: {
      type: Number,
      required: true,
      enum: [1, 2],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("soltRegistration", slotRegistration);
