const { Sequelize, DataTypes } = require("sequelize");
const UserModel = require("./users");
const PostModel = require("./posts");
const CommentModel = require("./comments");
const LikeModel = require("./likes");
const SaveModel = require("./saves");
const ConversationModel = require("./conversations");
const ConversationParticipantsModel = require("./conversationParticipants");
const MessageModel = require("./messages");
const FollowModel = require("./follow");

const sequelize = new Sequelize({
  dialect: "sqlite", // or mysql
  storage: "./db",
});

const User = UserModel(sequelize, DataTypes);
const Post = PostModel(sequelize, DataTypes);
const Comment = CommentModel(sequelize, DataTypes);
const Like = LikeModel(sequelize, DataTypes);
const Save = SaveModel(sequelize, DataTypes);
const Conversation = ConversationModel(sequelize, DataTypes);
const ConversationParticipants = ConversationParticipantsModel(sequelize, DataTypes);
const Message = MessageModel(sequelize, DataTypes);
const Follow = FollowModel(sequelize, DataTypes);

// Associations
User.hasMany(Post, { foreignKey: "userId" });
Post.belongsTo(User, { foreignKey: "userId" });

// Comments
User.hasMany(Comment, { foreignKey: "userId" });
Comment.belongsTo(User, { foreignKey: "userId" });

Post.hasMany(Comment, { foreignKey: "postId" });
Comment.belongsTo(Post, { foreignKey: "postId" });

// Likes
User.hasMany(Like, { foreignKey: "userId" });
Like.belongsTo(User, { foreignKey: "userId" });

Post.hasMany(Like, { foreignKey: "postId" });
Like.belongsTo(Post, { foreignKey: "postId" });

// Saves
User.hasMany(Save, { foreignKey: "userId" });
Save.belongsTo(User, { foreignKey: "userId" });

Post.hasMany(Save, { foreignKey: "postId" });
Save.belongsTo(Post, { foreignKey: "postId" });

User.hasMany(Message, { foreignKey: "senderId" });
Message.belongsTo(User, { foreignKey: "senderId" });

//Conversations + Messages
Conversation.hasMany(Message, { foreignKey: "conversationId" });
Message.belongsTo(Conversation, { foreignKey: "conversationId" });

Conversation.belongsToMany(User, { through: ConversationParticipants, foreignKey: "userId"});
User.belongsToMany(Conversation, { through: ConversationParticipants, foreignKey: "userId"});

ConversationParticipants.belongsTo(User, {
  foreignKey: "userId"
});

ConversationParticipants.belongsTo(Conversation, {
  foreignKey: "conversationId"
});

User.belongsToMany(User, {
  through: Follow,
  as: "followers",
  foreignKey: "followingId",
  otherKey: "followerId",
});

User.belongsToMany(User, {
  through: Follow,
  as: "followings",
  foreignKey: "followerId",
  otherKey: "followingId",
});

Follow.belongsTo(User, {
  as: "follower",       // user who follows someone
  foreignKey: "followerId"
});

Follow.belongsTo(User, {
  as: "following",      // user being followed
  foreignKey: "followingId"
});


module.exports = {
  sequelize,
  Sequelize,
  User,
  Post,
  Comment,
  Like,
  Save,
  Conversation,
  Message,
  Follow
};
