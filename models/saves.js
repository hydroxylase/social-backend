module.exports = (sequelize, DataTypes) => {
  const Save = sequelize.define("Save", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  });
  return Save;
};
