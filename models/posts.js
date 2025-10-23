module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define("Post", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    caption: { type: DataTypes.TEXT, allowNull: false },
    mediaUrl: { type: DataTypes.STRING },
    type: {
      type: DataTypes.ENUM("post", "reel"),
      defaultValue: "post",
    },
  });
  return Post;
};
