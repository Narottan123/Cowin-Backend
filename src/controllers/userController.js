const usermodel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const vaccineslotmodel = require("../models/vaccineSlotModel");
const registrationmodel = require("../models/slotRegistrationModel");
const userRegister = async (req, res) => {
  const { Name, PhoneNumber, Age, Pincode, AadharNo, password } = req.body;
  if (!Name) {
    return res.status(400).send({ msg: "Name is required" });
  }
  if (!PhoneNumber || !/^\d{10}$/.test(PhoneNumber)) {
    return res
      .status(400)
      .send({ msg: "Please enter valid 10 digit phone number" });
  }
  if (!Age || Age < 18) {
    return res.status(400).send({ msg: "Age must be at least 18" });
  }
  if (!Pincode || !/^\d{6}$/.test(Pincode)) {
    return res.status(400).send("Please enter a valid 6-digit pincode");
  }
  if (!AadharNo || !/^\d{12}$/.test(AadharNo)) {
    res
      .status(400)
      .send({ msg: "Please provide valid 12 digit aadhar card number" });
  }
  if (!password || password.length < 6) {
    res
      .status(400)
      .send({ msg: "Password must be at least 6 characters long" });
  }
  try {
    const existingUser = await usermodel.findOne({ PhoneNumber });
    if (existingUser) {
      return res
        .status(400)
        .send({ msg: "User with this phone number already exist" });
    }
    //hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new usermodel({
      Name,
      PhoneNumber,
      Age,
      Pincode,
      AadharNo,
      password: hashedPassword,
    });
    await newUser.save();
    return res.status(201).send({ msg: "Registration Successful" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: "internal server error" });
  }
};
const userLogin = async (req, res) => {
  let { PhoneNumber, password } = req.body;
  // Validation checks
  if (!PhoneNumber || !/^\d{10}$/.test(PhoneNumber)) {
    return res
      .status(400)
      .send({ msg: "Please enter a valid 10-digit phone number" });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).send({ msg: "Please enter a valid password" });
  }
  try {
    //find the user by their phone number
    const user = await usermodel.findOne({ PhoneNumber });
    if (!user) {
      return res.status(400).send({ msg: "Invalid login credentials" });
    }
    //compare the provided password with hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).send({ msg: "Invalid login credentials" });
    }
    //after login successful create jwt token
    let token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    return res.status(200).send({ msg: "Login Successful", token });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: "internal server error" });
  }
};
const slotDetails = async (req, res) => {
  try {
    let { date, doseNumber, id } = req.query;
    if (!date || !doseNumber || !id) {
      return res.status(400).send({ msg: "Invalid input data" });
    }
    if (req.user.id !== id) {
      return res.send({ msg: "User is not valid" });
    }
    let data = await vaccineslotmodel.find({
      date: date,
      doseNumber: doseNumber,
    });
    if (!data) {
      return res.status(404).send({ msg: "Vaccine Slot is not updated " });
    }
    let vaccineSlot = [];
    for (let i = 0; i < data.length; i++) {
      let obj = {
        startTime: data[i].startTime,
        endTime: data[i].endTime,
        availableDoses: data[i].availableDoses,
      };
      vaccineSlot.push(obj);
    }
    return res
      .status(200)
      .send({ msg: "Vaccine slot details for the choosing date", vaccineSlot });
  } catch (err) {
    console.error(error);
    return res.status(500).send({ msg: "Internal server error" });
  }
};
const bookSlot = async (req, res) => {
  try {
    const { userId, date, time, doseNumber } = req.body;
    // Basic input validation
    if (!userId || !date || !time || !doseNumber) {
      return res.status(400).json({ msg: "Invalid input data" });
    }
    if (req.user.id !== userId) {
      return res.send({ msg: "User is not valid" });
    }
    const slot = await vaccineslotmodel.findOne({
      date: date,
      startTime: time,
      doseNumber: doseNumber,
      availableDoses: { $gt: 0 },
    });
    if (!slot) {
      return res
        .status(404)
        .json({ msg: "Slot not available for registration" });
    }
    slot.availableDoses--;

    // Update the user's information directly in the database
    const userUpdateResult = await usermodel.updateOne(
      { _id: userId },
      {
        $set: {
          isVaccinated: true, // Set the user as vaccinated
          doseNumber: doseNumber, // Update the dose number
        },
      },
      { new: true, upsert: true }
    );

    console.log(userUpdateResult);
    if (userUpdateResult.nModified === 0) {
      // Check if the user document was not updated (user not found)
      console.log("User not found for userId:", userId);
    } else {
      console.log("User information updated");
    }
    const registration = new registrationmodel({
      userId: userId,
      date: date,
      time: time,
      doseNumber: doseNumber,
    });

    // Save the registration and update the slot
    await registration.save();
    await slot.save();
    // Find the user by their userId and update their information

    return res.status(201).json({ msg: "Registration successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error" });
  }
};
const bookSlot2 = async (req, res) => {
  try {
    const { userId, date, time, doseNumber } = req.body;
    // Basic input validation
    if (!userId || !date || !time || !doseNumber) {
      return res.status(400).json({ msg: "Invalid input data" });
    }
    let user = await usermodel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }
    if (req.user.id !== userId) {
      return res.send({ msg: "User is not valid" });
    }
    //if user dose number is 1 that means he is eligible for taking second dose
    if (user.doseNumber === 1) {
      const slot = await vaccineslotmodel.findOne({
        date: date,
        startTime: time,
        availableDoses: { $gt: 0 },
      });
      if (!slot) {
        return res
          .status(404)
          .json({ msg: "Slot not available for registration" });
      }
      slot.availableDoses--;
      // Update the user's information directly in the database
      const userUpdateResult = await usermodel.updateOne(
        { _id: userId },
        {
          $set: {
            isVaccinated: true, // Set the user as vaccinated
            doseNumber: doseNumber, // Update the dose number
          },
        },
        { new: true, upsert: true }
      );
      const registration = new registrationmodel({
        userId: userId,
        date: date,
        time: time,
        doseNumber: doseNumber,
      });

      // Save the registration and update the slot
      await registration.save();
      await slot.save();
      return res
        .status(201)
        .json({ msg: "Second Vaccine Registration successful" });
    }
  } catch (err) {
    console.error(error);
    return res.status(500).send({ msg: "Internal server error" });
  }
};
const slotUpdate = async (req, res) => {
  try {
    const { userId, newDate, newTime, newDoseNumber } = req.body;

    // Basic input validation
    if (!userId || !newDate || !newTime || !newDoseNumber) {
      return res.status(400).json({ msg: "Invalid input data" });
    }

    if (req.user.id !== userId) {
      return res.send({ msg: "User is not valid not authenticated" });
    }

    // Find the user's existing registration
    const existingRegistration = await registrationmodel.findOne({
      userId: userId,
    });

    if (!existingRegistration) {
      return res.status(404).json({ msg: "User has no existing registration" });
    }

    // Check if the update is allowed (up to 24 hours before the registered slot time)
    const registeredTime = new Date(
      existingRegistration.date + " " + existingRegistration.time
    );
    const updateDateTime = new Date(newDate + " " + newTime);
    const twentyFourHoursBeforeRegisteredTime = new Date(registeredTime);
    twentyFourHoursBeforeRegisteredTime.setHours(
      twentyFourHoursBeforeRegisteredTime.getHours() - 24
    );

    if (updateDateTime < twentyFourHoursBeforeRegisteredTime) {
      return res.status(400).json({
        msg: "Update is not allowed within 24 hours of the registered slot time",
      });
    }
    // Check if the new slot is available
    const slot = await vaccineslotmodel.findOne({
      date: newDate,
      startTime: newTime,
      doseNumber: newDoseNumber,
      availableDoses: { $gt: 0 },
    });

    if (!slot) {
      return res.status(404).json({ msg: "New slot is not available" });
    }

    // Update the registration with new slot details
    existingRegistration.date = newDate;
    existingRegistration.time = newTime;
    existingRegistration.doseNumber = newDoseNumber;
    await existingRegistration.save();

    return res.status(200).json({ msg: "Slot update successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error" });
  }
};
module.exports = {
  userRegister,
  userLogin,
  slotDetails,
  bookSlot,
  bookSlot2,
  slotUpdate,
};
