const { User } = require("../models");
const bcrypt = require("bcryptjs");
const {errorResponse,successResponse} = require("../utils/response")

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
