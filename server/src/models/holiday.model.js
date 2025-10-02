

module.exports = (sequelize, DataTypes) => {
  const Holiday = sequelize.define("Holiday", {
    holId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    holDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    holName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isFloater: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    description: { type: DataTypes.TEXT, allowNull: true },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: "holidays",
    timestamps: true,
  });

  return Holiday;
};
