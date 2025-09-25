const { Sequelize } = require("sequelize");
require("dotenv").config();

// DB_HOST=localhost
// DB_USER=root
// DB_PASS=yaseen
// DB_NAME=office_assistant 
// DB_PORT=3306

const sequelize = new Sequelize(
  process.env.DB_NAME || "office_assistant",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "yaseen",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
  }
);

module.exports = sequelize;
