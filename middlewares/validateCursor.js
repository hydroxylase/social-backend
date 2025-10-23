require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = (schema) => async (req, res, next) => {
  const { cursor } = req.query;
  try {
    if (!cursor || cursor == "") {
      req.cursor = null; // no cursor = first page
      console.log("run")
      next();
    } else {
      // Verify cursor integrity
      console.log(cursor);
      const decoded = JSON.parse(atob(cursor));
      console.log(decoded);
      // Validate cursor structure against schema (e.g. Joi)
      const valid = await schema.validateAsync(decoded);

      req.cursor = decoded; // safe to use downstream
      next();
    }
  } catch (err) {
    console.error("Invalid cursor:", err.message);
    return res.status(420).json({
      success: false,
      error: true,
      message: "Invalid or expired cursor",
      err: err
    });
    // req.cursor= null
    // next();
  }
};
