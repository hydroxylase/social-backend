module.exports = (sequelize, DataTypes) => {
  const ConversationParticipants = sequelize.define("ConversationParticipants", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    body: { type: DataTypes.TEXT, allowNull: false },
  });
  return ConversationParticipants;
};
