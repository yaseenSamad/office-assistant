const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { errorResponse } = require("../utils/response");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return errorResponse(res, "No token provided", 403);
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return errorResponse(res, "No token provided", 403);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    req.user = user;
    next();
  } catch (err) {
    return errorResponse(res, "Unauthorized", 401);
  }
};

module.exports = verifyToken;
