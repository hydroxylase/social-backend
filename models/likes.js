module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define("Like", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  });
  return Like;
};
