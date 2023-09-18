const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");

require("dotenv").config();

async function main() {
  const client = new MongoClient(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    console.log("connected to mongodb");
    const db = client.db("cowin");

    //admin credentials
    const adminCredentials = {
      username: "admin2000",
      password: "admin123",
      role: "admin",
    };
    //hash the password
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(
      adminCredentials.password,
      saltRound
    );

    //collection in db
    const collection = db.collection("admin");

    //insert the admin credentials
    const result = await collection.insertOne({
      username: adminCredentials.username,
      password: hashedPassword,
      role: adminCredentials.role,
    });
    console.log("Admin credentials inserted successfully:");
  } catch (err) {
    console.log(err);
  }
}
main();
