const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  const Policy = sequelize.define(
    "policies",
    {
      policyId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      documentUrl: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      updatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "policies",
      timestamps: true,
    }
  );



  return Policy;
};

