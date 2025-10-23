const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");
const { sequelize } = require("./models/");
const initSocket  = require("./sockets/")

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
initSocket(io);

// sync DB + start server
sequelize.sync().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
