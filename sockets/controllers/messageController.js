const { sequelize, Message, Conversation, ConversationParticipants, User } = require("../../models");
const { roomName } = require("../rooms");
const events = require("../events");

exports.sendMessage = async (socket, payload, ack) => {
  const uid = socket.user.id;
  const { conversationId, body } = payload || {};

  if (!conversationId) return ack?.({ success: false, error: "conversationId required" });
  if (!body || !body.trim()) return ack?.({ success: false, error: "empty_body" });

  try {
    // membership check
    const member = await ConversationParticipants.findOne({ where: { conversationId, userId: uid } });
    if (!member) return ack?.({ success: false, error: "not_participant" });

    const messageWithSender = await sequelize.transaction(async (t) => {
      const msg = await Message.create({
        conversationId,
        senderId: uid,
        body: body.trim(),
      }, { transaction: t });

      // touch conversation updatedAt to reorder inbox
      await Conversation.update({ updatedAt: new Date() }, { where: { id: conversationId }, transaction: t });

      const full = await Message.findOne({
        where: { id: msg.id },
        include: [{ model: User, as: "sender", attributes: ["id", "name", "avatar"] }],
        transaction: t,
      });

      return full;
    });

    // broadcast to room
    socket.server.to(roomName(conversationId)).emit(events.MESSAGE, { success: true, data: messageWithSender });

    // ack sender
    return ack?.({ success: true, data: messageWithSender });
  } catch (err) {
    console.error(err);
    return ack?.({ success: false, error: err.message });
  }
};
