module.exports = (sequelize, DataTypes) => {
  const LeaveRequest = sequelize.define("LeaveRequest", {
    leaveId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    leaveTypeId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    durationDays: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
      defaultValue: "Pending",
    },
    declineReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  }, {
    timestamps: true,
    tableName: "leave_requests",
  });

  return LeaveRequest;
};
