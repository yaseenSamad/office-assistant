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

exports.resetPassword = async (req, res) => {
  try {
    const { userId: targetUserId, newPassword } = req.body;
    const requestingUser = req.user;

    if (!targetUserId || !newPassword) {
      return errorResponse(res, "Missing required fields", 400);
    }

    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) {
      return errorResponse(res, "Target user not found", 404);
    }

    const canReset = () => {
      if (requestingUser.userId === targetUser.userId) {
        return true;
      }
      
      const requesterRole = requestingUser.role.toUpperCase();
      const targetRole = targetUser.role.toUpperCase();

      if (requesterRole === 'ADMIN') {
        return true;
      }

      if (requesterRole === 'HR' && targetRole === 'EMPLOYEE') {
        return true;
      }
      
      return false;
    };

    if (!canReset()) {
      return errorResponse(res, "You are not authorized to perform this action", 403);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update(
      { password: hashedPassword },
      { where: { userId: targetUserId } }
    );

    return successResponse(res, "Password reset successfully");
  } catch (error) {
    console.error('Password reset error:', error);
    return errorResponse(res, error);
  }
};
