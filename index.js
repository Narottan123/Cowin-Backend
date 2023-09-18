const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userroute = require("./src/routes/userRoute");
const adminroute = require("./src/routes/adminRoute");

require("dotenv").config();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("MongoDB is Connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use("/api/user", userroute);
app.use("/api/admin", adminroute);
let PORT = 8000 || process.env.PORT;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
