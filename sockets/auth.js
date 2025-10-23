const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

exports.socketAuth = (socket, next) => {

  try {
    // const token = socket.handshake.auth && socket.handshake.auth.token;
    const token = socket.handshake.headers.token;
    console.log(socket);
    if (!token) return next(new Error("Authentication required"));
    const payload = jwt.verify(token, JWT_SECRET);
    socket.user = { id: payload.id };
    return next();
  } catch (err) {
    return next(new Error("Authentication failed"));
  }
};
