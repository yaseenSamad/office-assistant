module.exports = (sequelize, DataTypes) => {
  const Payslip = sequelize.define("Payslip", {
    payslipId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    payPeriodStart: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    payPeriodEnd: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    grossSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    deductions: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    netSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("paid", "unpaid"),
        allowNull: false,
        defaultValue: 'unpaid'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
  },{
      tableName: "payslip",
      timestamps: true,
    }
);

  return Payslip;
};
