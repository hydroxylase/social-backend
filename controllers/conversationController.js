const { Conversation, Message, ConversationParticipants, User } = require("../models/");
const conversation = {}

// Create or get conversation between current user and target

conversation.getInbox = async (req, res) => {
  try {
    const userId = req.user.id;

    // fetch conversations the user participates in
    const conversations = await ConversationParticipants.findAll({
      where: { userId },
      include: [
        {
          model: Conversation,
          include: [
            {
              model: Message,
              order: [["createdAt", "DESC"]],
              limit: 1, // last message only
              include: [{ model: User, attributes: ["id", "username"] }],
            },
            {
              model: User,
              as: "participants",
              where: { id: { [Op.ne]: userId } }, // exclude self
              attributes: ["id", "username", "avatar"],
              through: { attributes: [] }, // omit junction table
            },
          ],
        },
      ],
      order: [[Conversation, Message, "createdAt", "DESC"]],
    });

    // map to clean structure
    const inbox = conversations.map((cp) => {
      const conv = cp.Conversation;
      return {
        conversationId: conv.id,
        participant: conv.participants,
        messagePreview: conv.Messages[0] || null,
      };
    });

    res.json({ success: true, error: false, data: inbox });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false, error: true, data: e.message });
  }
}

conversation.getConversationForUser = async (req, res) => {
  try {
    const { userId } = req.query;
    const currentUserId = req.user.id;

    if (userId === currentUserId) throw new Error("Cannot start conversation with yourself");

    // Check target user exists
    const userExists = await User.findByPk(userId, { attributes: ["id"] });
    if (!userExists) throw new Error("User does not exist!");

    // Check if conversation already exists (two participants only)
    const existing = await Conversation.findOne({
      include: [
        {
          model: ConversationParticipants,
          where: { userId: [currentUserId, userId] },
          attributes: []
        }
      ],
      group: ["Conversation.id"],
      having: sequelize.literal("COUNT(DISTINCT `ConversationParticipants`.`userId`) = 2")
    });

    if (existing) {
      return res.json({
        success: true,
        error: false,
        data: { id: existing.id }
      });
    }

    // Create new conversation + participants in transaction
    const newConversation = await sequelize.transaction(async (t) => {
      const convo = await Conversation.create({}, { transaction: t });
      await ConversationParticipants.bulkCreate(
        [
          { userId, conversationId: convo.id },
          { userId: currentUserId, conversationId: convo.id }
        ],
        { transaction: t }
      );
      return convo;
    });

    return res.json({
      success: true,
      error: false,
      data: { id: newConversation.id }
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({
      success: false,
      error: true,
      data: e.message
    });
  }
};


// Get messages for a conversation
conversation.getConversationMessages = async (req, res) => {
  try {
    
    const limit  = 25;
    const cursor = req.cursor;
    const cursorOptions = cursor !== null ? {
      [Op.or]: [
        { createdAt: { [Op.lte]: cursor.createdAt } },
        {
          [Op.and]: [
            { createdAt: cursor.createdAt },
            { id: { [Op.lt]: cursor.id } }
          ]
        }
      ]
    } : {};
    const { id: conversationId } = req.params;
    const currentUserId = req.user.id;

    // Ensure user is part of conversation
    const participant = await ConversationParticipants.findOne({
      where: { conversationId, userId: currentUserId }
    });
    if (!participant) throw new Error("You are not a member of this conversation");

    // Get messages with pagination + ordering
    const messages = await Message.findAll({
      where: { conversationId },
      order: [["createdAt", "DESC"], ["id", "DESC"]],
      limit: limit +1 // could also use cursor-based for infinite scroll
    });

    let nextCursor = null;
    let hasMore = null
    if (messages.length > limit){
      hasMore = true;
      const {id, createdAt} = messages.pop();
      const cursorString = JSON.stringify({id, createdAt});
      nextCursor = btoa(cursorString);
    }

    res.json({ success: true, error: false, data: messages, hasMore, nextCursor });
  } catch (e) {
    console.error(e);
    res.status(400).json({
      success: false,
      error: true,
      data: e.message
    });
  }
};


module.exports = conversation;