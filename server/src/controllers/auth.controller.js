const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const {errorResponse,successResponse} = require("../utils/response")


const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username: username } });

    if (!user) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
       return errorResponse(res, "Invalid credentials", 401);
    }

    const token = jwt.sign(
      { userId: user.userId, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const response = {
      user: {
        userId: user.userId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        primaryEmail: user.primaryEmail,
        role: user.role,
        department: user.department,
        subDepartment: user.subDepartment,
        designation: user.designation,
        officeId: user.officeId,
      },
      token,
    };

    return successResponse(res, "Success", response);
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, error);
  }
};
