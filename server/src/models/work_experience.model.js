
module.exports = (sequelize, DataTypes) => {
  const WorkExperience = sequelize.define("WorkExperience", {
    workExperienceId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(100),
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
    },
    currentWorkStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    skills: {
      type: DataTypes.STRING(255),
    },
    userId: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      allowNull: false,
    },
  }, {
    tableName: "workexperiences",
  });

  return WorkExperience;
};
