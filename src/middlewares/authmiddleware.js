const jwt = require("jsonwebtoken");

function authentication(req, res, next) {
  let token = req.headers["x-auth-token"];
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log("token invalid");
      return res.status(404).send({ msg: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
}
function authorization(req, res, next) {
  if (req.user.role === "admin") {
    next();
  } else {
    res.send({ msg: "Unauthorized to access" });
  }
}
module.exports = { authentication, authorization };
