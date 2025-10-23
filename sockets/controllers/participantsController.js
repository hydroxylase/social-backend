const { ConversationParticipants } = require("../../models");
const { roomName } = require("../rooms");

exports.autoJoin = async (socket) => {
  const uid = socket.user.id;
  const rows = await ConversationParticipants.findAll({
    where: { userId: uid },
    attributes: ["conversationId"],
  });
  for (const r of rows) socket.join(roomName(r.conversationId));
};

exports.joinConversation = async (socket, payload, ack) => {
  try {
    const uid = socket.user.id;
    const { conversationId } = payload;
    const member = await ConversationParticipants.findOne({ where: { conversationId, userId: uid }});
    if (!member) return ack?.({ success: false, error: "not_participant" });
    socket.join(roomName(conversationId));
    return ack?.({ success: true });
  } catch (e) {
    console.error(e);
    return ack?.({ success: false, error: e.message });
  }
};

exports.leaveConversation = async (socket, payload, ack) => {
  try {
    const { conversationId } = payload;
    socket.leave(roomName(conversationId));
    return ack?.({ success: true });
  } catch (e) {
    console.error(e);
    return ack?.({ success: false, error: e.message });
  }
};
