
module.exports = (sequelize, DataTypes) => {
  const Education = sequelize.define("Education", {
    courseId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    course: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    institution: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    fieldOfStudy: {
      type: DataTypes.STRING(100),
    },
    startDate: {
      type: DataTypes.DATEONLY,
    },
    endDate: {
      type: DataTypes.DATEONLY,
    },
    grade: {
      type: DataTypes.STRING(20),
    },
    description: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: "education",
  });

  return Education;
};
