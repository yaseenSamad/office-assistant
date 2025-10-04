const { LeaveRequest, LeaveType, User } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");

exports.createLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.create({ ...req.body, createdBy: req.params.userId });
    return successResponse(res, "Leave type created successfully", leaveType);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to create leave type");
  }
};

exports.getLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.findAll({
      // include: [{ model: User, as: "creator", attributes: ["firstName", "lastName"] }],
    });
    return successResponse(res, "Leave types fetched", leaveTypes);
  } catch (err) {
    console.log(error)
    return errorResponse(res, "Failed to fetch leave types");
  }
};

exports.updateLeaveType = async (req, res) => {
  try {
    const { id } = req.params;
    await LeaveType.update(req.body, { where: { leaveTypeId: id } });
    return successResponse(res, "Leave type updated");
  } catch (err) {
    return errorResponse(res, "Failed to update leave type");
  }
};

exports.deleteLeaveType = async (req, res) => {
  try {
    const { id } = req.params;
    await LeaveType.destroy({ where: { leaveTypeId: id } });
    return successResponse(res, "Leave type deleted");
  } catch (err) {
    return errorResponse(res, "Failed to delete leave type");
  }
};

// Apply Leave
exports.applyLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.create({
      ...req.body,
      userId: req.params.userId,
    });
    return successResponse(res, "Leave applied successfully", leave);
  } catch (err) {
    return errorResponse(res, "Failed to apply leave");
  }
};

// Get My Leaves
exports.getMyLeaves = async (req, res) => {
  const leaves = await LeaveRequest.findAll({
    where: { userId: req.params.userId },
    include: [
      { model: LeaveType, as: "leaveType", attributes: ["name"] },
      { model: User, as: "approver", attributes: ["firstName", "lastName"] },
      { model: User, as: "requester", attributes: ["firstName", "lastName"] },
    ],
    order: [["createdAt", "DESC"]],
  });
  return successResponse(res, "My leaves fetched", leaves);
};

// Get Leaves Awaiting My Approval
exports.getPendingApprovals = async (req, res) => {
  const user = req.user;

  // Only HR/Admin/Reporter can see this
  const leaves = await LeaveRequest.findAll({
    where: { status: "Pending" },
    include: [
      { model: User, as: "employee", attributes: ["firstName", "lastName", "reporter"] },
      { model: LeaveType, as: "leaveType", attributes: ["name"] },
    ],
  });

  // Filter by: if I'm HR, Admin, or the employee's reporter
  const filtered = leaves.filter(l =>
    user.role === "hr" || user.role === "admin" || l.employee.reporter === user.userId
  );

  return successResponse(res, "Leaves awaiting your approval", filtered);
};

// Approve / Reject
exports.approveLeave = async (req, res) => {
  const { leaveId,userId } = req.params;
  const { status, declineReason } = req.body;

  await LeaveRequest.update(
    { status, declineReason, approvedBy: userId },
    { where: { leaveId: leaveId } }
  );

  return successResponse(res, "Leave status updated");
};
