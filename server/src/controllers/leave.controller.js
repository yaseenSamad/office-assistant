const { LeaveRequest, LeaveType, User } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");
const { Op, fn, col, where } = require("sequelize");
const { sendLeaveAppliedEmail,sendLeaveStatusEmail } = require("../utils/emailService");

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
    console.log(req.query.year,'req.query.year')
    const userId = req.params.userId
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31`);

    const leaveTypes = await LeaveType.findAll({
        include: [
        {
          model: LeaveRequest,
          as: "requests",
          required: false,
          where: {
            userId,
            [Op.or]: [
              { startDate: { [Op.between]: [startOfYear, endOfYear] } },
              { endDate: { [Op.between]: [startOfYear, endOfYear] } },
              {
                [Op.and]: [
                  { startDate: { [Op.lt]: startOfYear } },
                  { endDate: { [Op.gt]: endOfYear } }
                ]
              }
            ],
          },
           attributes: ["status", "startDate", "endDate", "durationDays"],
        },
      ],
      // include: [{ model: User, as: "creator", attributes: ["firstName", "lastName"] }],
    });



      const summary = leaveTypes.map((lt) => {

      let approvedDays = 0;
      let pendingDays = 0;

      for (const req of lt.requests || []) {
        const leaveStart = new Date(req.startDate);
        const leaveEnd = new Date(req.endDate);

        const effectiveStart =
          leaveStart < startOfYear ? startOfYear : leaveStart;
        const effectiveEnd = leaveEnd > endOfYear ? endOfYear : leaveEnd;

        const overlapDays =
          Math.ceil((effectiveEnd - effectiveStart) / (1000 * 60 * 60 * 24)) + 1;


          const actualDays = req.durationDays == 1 ? overlapDays :  0.5 * overlapDays  ;

        if (req.status === "Approved") approvedDays += actualDays;
        if (req.status === "Pending") pendingDays += actualDays;
      }

      const remaining = lt.totalAllowed - (approvedDays + pendingDays);

      return {
        leaveTypeId: lt.leaveTypeId,
        name: lt.name,
        totalAllowed: lt.totalAllowed,
        // approvedDays,
        // pendingDays,
        used: (approvedDays + pendingDays),
        remaining: remaining < 0 ? 0 : remaining,
        carryForward: lt.carryForward,
        isHalfDayAllowed: lt.isHalfDayAllowed
      };
    });

    return successResponse(res, "Leave types fetched", summary);
  } catch (err) {
    console.log(err)
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

exports.applyLeave = async (req, res) => {
  try {
    const { userId } = req.params;

    const leave = await LeaveRequest.create({
      ...req.body,
      userId,
    });

    const user = await User.findByPk(userId);
    const leaveType = await LeaveType.findByPk(leave.leaveTypeId);

    const conditions = {
      [Op.or]: [
        { role: "hr" },
        { role: "admin" },
      ],
    };

    if (user.reporter) {
      conditions[Op.or].push({ userId: user.reporter });
    }

    const reportersList = await User.findAll({
      where: conditions,
      attributes: [
        "primaryEmail",
        "secondaryEmail",
        "firstName",
        "lastName",
        "role",
        "userId",
      ],
    });

    for (const rprtr of reportersList) {
      const recipientEmail = rprtr.primaryEmail || rprtr.secondaryEmail;
      if (!recipientEmail) continue;

      await sendLeaveAppliedEmail(recipientEmail, {
        name: `${user.firstName} ${user.lastName}`,
        leaveType: leaveType ? leaveType.name : "Miscellaneous Leave",
        startDate: leave.startDate,
        endDate: leave.endDate,
        durationDays: leave.durationDays,
        reason: leave.reason,
      });
    }

    return successResponse(res, "Leave applied successfully and email(s) sent", leave);
  } catch (err) {
    console.error("Error in applyLeave:", err);
    return errorResponse(res, "Failed to apply leave");
  }
};

exports.getMyLeaves = async (req, res) => {
    try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
        const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31`);

    const leaves = await LeaveRequest.findAll({
      where: { 
        userId: req.params.userId ,
        [Op.or]: [
              { startDate: { [Op.between]: [startOfYear, endOfYear] } },
              { endDate: { [Op.between]: [startOfYear, endOfYear] } },
              {
                [Op.and]: [
                  { startDate: { [Op.lt]: startOfYear } },
                  { endDate: { [Op.gt]: endOfYear } }
                ]
              }
          ],
        },
      include: [
        { model: LeaveType, as: "leaveType", attributes: ["name"] },
        { model: User, as: "approver", attributes: ["firstName", "lastName"] },
        { model: User, as: "requester", attributes: ["firstName", "lastName"] },
      ],
      order: [["createdAt", "DESC"]],
    });
  return successResponse(res, "My leaves fetched", leaves);
    } catch (err) {
    return errorResponse(res, "Failed to fetch leaves");
  }
};

exports.getPendingApprovals = async (req, res) => {
  try{
    const user = await User.findByPk(req.params.userId);

    const leaves = await LeaveRequest.findAll({
      where: { status: "Pending" },
      include: [
        { model: User, as: "requester", attributes: ["firstName", "lastName", "reporter"] },
        { model: LeaveType, as: "leaveType", attributes: ["name"] },
      ],
    });

    const filtered = leaves.filter(l =>
      user.role === "hr" || user.role === "admin" || l.requester.reporter === user.userId
    );

    return successResponse(res, "Leaves awaiting your approval", filtered);
  } catch (err) {
    console.log(err)
    return errorResponse(res, "Failed to fetch leaves awaiting for approval");
  }
};

exports.approveLeave = async (req, res) => {
  const { leaveId, userId } = req.params;
  const { status, declineReason } = req.body;

  try {
    await LeaveRequest.update(
      { status, declineReason, approvedBy: userId },
      { where: { leaveId } }
    );

    const leave = await LeaveRequest.findByPk(leaveId, {
      include: [
        { model: User, as: "requester", attributes: ["firstName", "lastName", "primaryEmail", "secondaryEmail"] },
        { model: User, as: "approver", attributes: ["firstName", "lastName", "primaryEmail", "secondaryEmail"] },
        { model: LeaveType, as: "leaveType", attributes: ["name"] },
      ],
    });

    if (!leave) {
      return errorResponse(res, "Leave record not found");
    }

    const employee = leave.requester;
    const approver = leave.approver
    const recipientEmail = employee?.primaryEmail || employee?.secondaryEmail;

    if (!recipientEmail) {
      console.warn("No email found for user:", employee?.userId);
      return successResponse(res, "Leave status updated, but no email sent (no email found)");
    }

    await sendLeaveStatusEmail(recipientEmail, {
      name: `${employee.firstName} ${employee.lastName}`,
      leaveType: leave.leaveType?.name || "Leave Request",
      startDate: leave.startDate,
      endDate: leave.endDate,
      status: leave.status,
      declineReason,
      approvedBy: `${approver.firstName} ${approver.lastName}`,
    });

    return successResponse(res, "Leave status updated and notification sent");
  } catch (err) {
    console.error("Error approving leave:", err);
    return errorResponse(res, "Failed to update leave status");
  }
};
