const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Import models
const User = require("./user.model")(sequelize, DataTypes);

// Associations
User.belongsTo(User, { as: "reporterUser", foreignKey: "reporter" });

module.exports = { sequelize, User };
