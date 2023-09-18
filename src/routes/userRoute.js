const express = require("express");
const {
  userRegister,
  userLogin,
  slotDetails,
  bookSlot,
  bookSlot2,
  slotUpdate,
} = require("../controllers/userController");
const { authentication } = require("../middlewares/authmiddleware");
const router = express.Router();

//register
router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/slotdetails", authentication, slotDetails);
router.post("/bookslot", authentication, bookSlot);
router.post("/bookslot2", authentication, bookSlot2);
router.put("/slotupdate", authentication, slotUpdate);
module.exports = router;
