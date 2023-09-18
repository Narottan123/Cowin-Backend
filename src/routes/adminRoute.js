const {
  authentication,
  authorization,
} = require("../middlewares/authmiddleware");
const express = require("express");
const {
  vaccineslotData,
  login,
  totalUserRegister,
  fetchSlot,
} = require("../controllers/adminController");
const router = express.Router();

router.post("/vaccineslot", authentication, authorization, vaccineslotData);
router.post("/login", login);
router.get(
  "/totaluserregister",
  authentication,
  authorization,
  totalUserRegister
);
router.post(
  "/slotRegistrationDetails",
  authentication,
  authorization,
  fetchSlot
);

module.exports = router;
