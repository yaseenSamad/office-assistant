const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
const TeamMember = sequelize.define(
    "team_members",
    {
      teamMemberId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4, // Sequelize-generated UUID
      },
      teamId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      roleInTeam: {
        type: DataTypes.ENUM("Manager", "Lead", "Member"),
        allowNull: false,
        defaultValue: "Member",
      },
      joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "team_members",
      timestamps: true,
    }
  );

  // TeamMember.associate = (models) => {
  //   TeamMember.belongsTo(models.teams, {
  //     foreignKey: "teamId",
  //     as: "team",
  //     onDelete: "CASCADE",
  //   });

  //   TeamMember.belongsTo(models.users, {
  //     foreignKey: "userId",
  //     as: "user",
  //     onDelete: "CASCADE",
  //   });
  // };

  return TeamMember;
};
