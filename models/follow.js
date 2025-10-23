module.exports = (sequelize, DataTypes) => {
  const Follow = sequelize.define("Follow", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  });
  return Follow;
};
