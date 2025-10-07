const { LeaveRequest, LeaveType, User } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");
const { Op, fn, col } = require("sequelize");

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
    const leave = await LeaveRequest.create({
      ...req.body,
      userId: req.params.userId,
    });
    return successResponse(res, "Leave applied successfully", leave);
  } catch (err) {
    console.log(err)
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
  const { leaveId,userId } = req.params;
  const { status, declineReason } = req.body;

  await LeaveRequest.update(
    { status, declineReason, approvedBy: userId },
    { where: { leaveId: leaveId } }
  );

  return successResponse(res, "Leave status updated");
};
