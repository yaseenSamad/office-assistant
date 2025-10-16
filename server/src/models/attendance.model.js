module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define("Attendance", {
    attendanceId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    attendanceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    clockInTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    clockOutTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isManualOut: {
      type: DataTypes.BOOLEAN, // true if manually clocked out, false if system, null if not yet out
      defaultValue: null,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: "attendances",
    timestamps: true,
  });

  return Attendance;
};
