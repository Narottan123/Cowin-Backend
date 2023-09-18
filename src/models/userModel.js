const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  PhoneNumber: {
    type: String,
    required: true,
  },
  Age: {
    type: Number,
    required: true,
  },
  Pincode: {
    type: String,
    required: true,
  },
  AadharNo: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  doseNumber: {
    type: Number,
    enum: [1, 2],
  },
  isVaccinated: {
    type: Boolean,
    default: false,
  },
});
module.exports = mongoose.model("cowinuser", userSchema);
