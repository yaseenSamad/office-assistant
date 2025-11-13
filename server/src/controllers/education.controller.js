const { Education } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");

exports.createEducation = async (req, res) => {
  try {
    const { userId } = req.params;
    const education = await Education.create({ ...req.body, userId });
    return successResponse(res, "Education created successfully", education);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to create education");
  }
};

exports.updateEducation = async (req, res) => {
  try {
    const { id } = req.params;
    await Education.update(req.body, { where: { courseId: id } });
    return successResponse(res, "Education updated successfully");
  } catch (err) {
    return errorResponse(res, "Failed to update education");
  }
};

exports.deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;
    await Education.destroy({ where: { courseId: id } });
    return successResponse(res, "Education deleted successfully");
  } catch (err) {
    return errorResponse(res, "Failed to delete education");
  }
};
