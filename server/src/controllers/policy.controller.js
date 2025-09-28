const Policy = require('../models/policy.model')
const {errorResponse,successResponse} = require("../utils/response")

exports.createPolicy = async (req, res) => {
  try {
    const { title, description, updatedBy } = req.body;
    const documentPath = req.file ? `/uploads/policies/${req.file.filename}` : null;

    console.log(documentPath,'documentPath')

    const policy = await Policy.create({
      title,
      description,
      documentPath,
      updatedBy,
    });
    return successResponse(res, 'Policy created successfully', policy);
  } catch (err) {
    return errorResponse(res, 'Failed to create policy', 500);
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    const { policyId } = req.params;
    await Policy.destroy({ where: { policyId } });
    return successResponse(res, 'Policy deleted successfully', null);
  } catch (err) {
    return errorResponse(res, 'Failed to delete policy', 500);
  }
};

exports.getPolicies = async (req, res) => {
  try {
    const users = await Policy.findAll();
    return successResponse(res, "Policies fetched successfully", users);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch policies', 500);
  }
};