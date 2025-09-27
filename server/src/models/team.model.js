const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define(
    "teams",
    {
      teamId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4, // Use Sequelize's UUID generator
      },
      teamName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
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
      tableName: "teams",
      timestamps: true, // automatically manage createdAt/updatedAt
    }
  );

  // Associations
//   Team.associate = (models) => {
//     Team.hasMany(models.team_members, {
//       foreignKey: "teamId",
//       as: "members",
//       onDelete: "CASCADE",
//     });
//   };

  return Team;
};

