const auth = require("./auth");
const events = require("./events");
const controllers = require("./controllers"); // folder index exports handlers
const rooms = require("./rooms");

const initSocket = (io) => {
  // auth middleware for sockets
  io.use(auth.socketAuth);

  io.on("connection", async (socket) => {
    //const uid = socket.user.id;
    // auto-join all rooms the user participates in
    console.log("connected");
    try {
      await controllers.participants.autoJoin(socket);
    } catch (e) {
      console.error("auto-join failed", e);
    }

    // wire events to controller handlers
    socket.on(events.JOIN, (p, ack) => controllers.participants.joinConversation(socket, p, ack));
    socket.on(events.LEAVE, (p, ack) => controllers.participants.leaveConversation(socket, p, ack));
    socket.on(events.SEND_MESSAGE, (p, ack) => controllers.message.sendMessage(socket, p, ack));
    // optional other events...
  });
}

module.exports = initSocket;