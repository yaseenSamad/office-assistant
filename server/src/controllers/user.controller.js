const { User } = require("../models");
const bcrypt = require("bcryptjs");
const {errorResponse,successResponse} = require("../utils/response");
const { Op, Sequelize } = require("sequelize");
const moment = require("moment");

exports.createUser = async (req, res) => {
  try {
    const {
      username, password, firstName, lastName,
      primaryPhone, primaryEmail, permanentAddress,
      officeId, bloodGroup, dob, gender, maritalStatus,
      nationality, department, subDepartment, role, designation,
      secondaryPhone, secondaryEmail, temporaryAddress, linkedin, reporter
    } = req.body;


    if (!username || !password || !firstName || !primaryPhone || !primaryEmail) {
      return errorResponse(res, "Missing required fields", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      primaryPhone,
      secondaryPhone,
      primaryEmail,
      secondaryEmail,
      permanentAddress,
      temporaryAddress,
      officeId,
      bloodGroup,
      dob,
      gender,
      maritalStatus,
      nationality,
      linkedin,
      department,
      subDepartment,
      role,
      designation,
      reporter,
    });

    return successResponse(res, "User created successfully", { userId: user.userId });
    } catch (err) {
    return errorResponse(res, err);
    }
};



exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    return successResponse(res, "Users fetched successfully", users);
  } catch (err) {
    return errorResponse(res, err);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return errorResponse(res, "User not found", 404);
    return successResponse(res, "User fetched successfully", user);
  } catch (err) {
    return errorResponse(res, err);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const result = await User.destroy({ where: { userId: req.params.id } });
    if (!result) return errorResponse(res, "User not found", 404);
    return successResponse(res, "User deleted successfully");
  } catch (err) {
    return errorResponse(res, err);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      updateData.profilePicture = `/uploads/avatars/${req.file.filename}`;
    }

    const result = await User.update(updateData, { where: { userId: id } });
    if (!result[0]) return errorResponse(res, "User not found", 404);

    const updatedUser = await User.findByPk(id);
    return successResponse(res, "User updated successfully", updatedUser);
  } catch (err) {
    return errorResponse(res, err);
  }
};

exports.getUpcomingBirthdays = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['firstName', 'lastName', 'dob', 'subDepartment'],
      where: {
        [Op.and]: [
          Sequelize.where(Sequelize.fn('DAYOFYEAR', Sequelize.col('dob')), '>=', Sequelize.fn('DAYOFYEAR', new Date())),
          Sequelize.where(Sequelize.fn('DAYOFYEAR', Sequelize.col('dob')), '<=', Sequelize.fn('DAYOFYEAR', new Date(new Date().setDate(new Date().getDate() + 30)))),
        ]
      }
    });

    const formattedBirthdays = users.map(user => ({
      name: `${user.firstName} ${user.lastName}`,
      department: user.subDepartment,
      birthday: moment(user.dob).format('MMMM Do')
    }));

    return successResponse(res, "Upcoming birthdays fetched successfully", formattedBirthdays);
  } catch (err) {
    console.error("Error fetching upcoming birthdays:", err);
    return errorResponse(res, "Failed to fetch upcoming birthdays");
  }
};
