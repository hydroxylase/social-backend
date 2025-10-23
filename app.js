// app.js
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors")

// built-in middleware
app.use(cors("*"));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname,'uploads'))); // serve files

//versioned API prefix
app.use("/api/v1", require("./routes"));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

// global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
