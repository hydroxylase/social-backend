module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define("Message", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    body: { type: DataTypes.TEXT, allowNull: false },
  });
  return Message;
};
