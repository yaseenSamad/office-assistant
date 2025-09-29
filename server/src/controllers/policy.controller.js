const {Policy,User} = require('../models')
const {errorResponse,successResponse} = require("../utils/response")

exports.createPolicy = async (req, res) => {
  try {
    const { title, description, updatedBy } = req.body;
    const documentUrl = req.file ? `${req.protocol}://${req.get("host")}/uploads/policies/${req.file.filename}` : null;


    const policy = await Policy.create({
      title,
      description,
      documentUrl,
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
   const policy = await Policy.findAll({
    include: [
        {
        model: User,
        as: "updater",
        attributes: ["firstName", "lastName"],
        },
    ],
    });

    const formatted = policy.map(p => ({
    ...p.toJSON(),
    updatedBy: p.updater 
        ? `${p.updater.firstName} ${p.updater.lastName}` 
        : null,
    }));

    return successResponse(res, "Policies fetched successfully", formatted);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch policies', 500);
  }
};