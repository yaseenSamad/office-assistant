const { Salary, User } = require("../models");
const { errorResponse, successResponse } = require("../utils/response");

exports.createOrUpdateSalary = async (req, res) => {
  try {
    // Authorization: HR or Admin only
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
        return errorResponse(res, "Access denied. You must be an Admin or HR.", 403);
    }

    const { userId } = req.params;
    const { amount, payType } = req.body;

    if (!amount || !payType) {
      return errorResponse(res, "Missing required fields: amount and payType", 400);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const [salary, created] = await Salary.findOrCreate({
      where: { userId },
      defaults: { amount, payType }
    });

    if (!created) {
      await salary.update({ amount, payType });
    }

    return successResponse(res, `Salary ${created ? 'created' : 'updated'} successfully`, salary);
  } catch (err) {
    return errorResponse(res, "Server error while setting salary.");
  }
};

exports.getSalaryByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Authorization: Admin, HR, or the user themselves
    if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.userId !== userId) {
        return errorResponse(res, "Access denied.", 403);
    }

    const salary = await Salary.findOne({ where: { userId } });

    if (!salary) {
      return errorResponse(res, "Salary information not found for this user", 404);
    }

    return successResponse(res, "Salary fetched successfully", salary);
  } catch (err) {
    return errorResponse(res, "Server error while fetching salary.");
  }
};

exports.deleteSalary = async (req, res) => {
  try {
    // Authorization: HR or Admin only
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
        return errorResponse(res, "Access denied. You must be an Admin or HR.", 403);
    }
    
    const { userId } = req.params;
    const result = await Salary.destroy({ where: { userId } });

    if (!result) {
      return errorResponse(res, "Salary information not found for this user", 404);
    }

    return successResponse(res, "Salary deleted successfully");
  } catch (err) {
    return errorResponse(res, "Server error while deleting salary.");
  }
};
