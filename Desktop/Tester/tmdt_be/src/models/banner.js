export default (sequelize, DataTypes) => {
  const Banner = sequelize.define(
    "Banner",
    {
      title: { type: DataTypes.STRING, allowNull: true },
      image: { type: DataTypes.STRING, allowNull: false },
      link: { type: DataTypes.STRING, allowNull: true },
      position: { type: DataTypes.STRING, allowNull: false, defaultValue: "home" },
      order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: "banners" }
  );
  return Banner;
};
