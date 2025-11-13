const { WorkExperience } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");

exports.createWorkExperience = async (req, res) => {
  try {
    const { userId } = req.params;
    const workExperience = await WorkExperience.create({ ...req.body, userId });
    return successResponse(res, "Work experience created successfully", workExperience);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to create work experience");
  }
};

exports.updateWorkExperience = async (req, res) => {
  try {
    const { id } = req.params;
    await WorkExperience.update(req.body, { where: { workExperienceId: id } });
    return successResponse(res, "Work experience updated successfully");
  } catch (err) {
    return errorResponse(res, "Failed to update work experience");
  }
};

exports.deleteWorkExperience = async (req, res) => {
  try {
    const { id } = req.params;
    await WorkExperience.destroy({ where: { workExperienceId: id } });
    return successResponse(res, "Work experience deleted successfully");
  } catch (err) {
    return errorResponse(res, "Failed to delete work experience");
  }
};
