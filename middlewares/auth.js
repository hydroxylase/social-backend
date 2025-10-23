require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const header = req.headers["authorization"];
    if (!header) throw new Error("No authorization header provided");

    const parts = header.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new Error("Invalid authorization format");
    }
    console.log("again");

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: decoded.id, email: decoded.email };
    next();
    console.log("done");
  } catch (e) {
    console.error(e);
    res.status(401).json({ success: false, error: true, message: "Unauthorized" });
  }
};

module.exports = auth;
