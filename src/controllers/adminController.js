const vaccineslotmodel = require("../models/vaccineSlotModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");
const slotRegistrationModel = require("../models/slotRegistrationModel");

require("dotenv").config();
const vaccineslotData = async (req, res) => {
  try {
    const client = new MongoClient(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    const db = client.db("cowin");
    const collection1 = db.collection("admin");

    if (req.user.id !== collection1._id) {
      return res.send({ msg: "admin is not valid" });
    }
    const { date, startTime, type, availableDoses, doseNumber } = req.body;
    const startDate = new Date("2021-06-01");
    const endDate = new Date("2021-06-30");
    const slotDate = new Date(date);
    if (slotDate < startDate || slotDate > endDate) {
      return res.status(400).send({ msg: "Invalid Date for vaccination" });
    }
    //create new slot with 30 min duration and 10 available vaccine
    const newSlot = new vaccineslotmodel({
      date,
      startTime,
      endTime: calculateEndTime(startTime),
      type,
      availableDoses,
      doseNumber,
    });
    await newSlot.save();
    return res.status(201).send({ msg: "vaccine data successfully send" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: "internal server error" });
  }
};
// Function to calculate the end time with a 30-minute interval
function calculateEndTime(startTime) {
  let startTimeParts = startTime.split(":");
  let startHour = parseInt(startTimeParts[0]);
  let startMinute = parseInt(startTimeParts[1]);

  // Calculate the end hour and minute
  let endHour = startHour;
  let endMinute;

  if (startMinute === 0) {
    endMinute = 30;
  } else if (startMinute === 30) {
    endHour++;
    endMinute = 0;
  }

  // Format the end time as a string with AM/PM
  const amPm = endHour < 12 ? "AM" : "PM";
  const formattedEndTime = `${endHour % 12}:${
    endMinute === 0 ? "00" : endMinute
  } ${amPm}`;

  return formattedEndTime;
}

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate the username and password
    if (!username || !password) {
      return res
        .status(400)
        .json({ msg: "Username and password are required" });
    }

    // Connect to the database
    const client = new MongoClient(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db("cowin");

    // Find the admin with the provided username
    const collection = db.collection("admin");
    const admin = await collection.findOne({ username });

    // If admin not found or password doesn't match, send an error response
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // Admin is authenticated, generate a JWT token
    const token = jwt.sign(
      { userId: admin._id, role: admin.role },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
const totalUserRegister = async (req, res) => {
  try {
    const { Age, Pincode } = req.query;
    //connect to database
    const client = new MongoClient(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    const db = client.db("cowin");
    const collection = db.collection("cowinusers");
    const collection1 = db.collection("admin");

    if (req.user.id !== collection1._id) {
      return res.send({ msg: "admin is not valid" });
    }

    //filter based on query params
    const filter = {};
    if (Age) {
      filter.Age = parseInt(Age);
    }
    if (Pincode) {
      filter.Pincode = Pincode;
    }
    //find users based on filter
    const users = await collection.find(filter).toArray();
    const totaluser = users.length;
    return res.status(200).send({ totaluser, users });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Internal server error" });
  }
};
const fetchSlot = async (req, res) => {
  try {
    if (req.user.id !== collection._id) {
      return res.send({ msg: "admin is not valid" });
    }
    const { date } = req.body;
    let slotdetails = await slotRegistrationModel.find({ date: date });
    if (!slotdetails) {
      return res.status(404).send({ msg: "No slot found" });
    }
    return res.status(200).send({ slotdetails });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = { vaccineslotData, login, totalUserRegister, fetchSlot };
