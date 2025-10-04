module.exports = (sequelize, DataTypes) => {
  const LeaveType = sequelize.define("LeaveType", {
    leaveTypeId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    totalAllowed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isHalfDayAllowed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    carryForward: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdBy: {
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
  },{
      tableName: "leave_types",
      timestamps: true,
    }
);

  return LeaveType;
};
