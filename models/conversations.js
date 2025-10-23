module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define("Conversation", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  });
  return Conversation;
};
