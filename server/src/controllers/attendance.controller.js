const { Attendance, User, Sequelize } = require("../models");
const { Op, fn, col } = require("sequelize");
const { successResponse, errorResponse } = require("../utils/response");
const moment = require('moment');

exports.getAttendanceList = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.body;

    if (!userId || !startDate || !endDate) {
      return errorResponse(res, "userId, startDate, and endDate are required");
    }

    const attendanceHistory = await Attendance.findAll({
      where: {
        userId,
        attendanceDate: { [Op.between]: [startDate, endDate] },
      },
      order: [["attendanceDate", "DESC"]],
    });

    return successResponse(res, "Attendance history fetched successfully", attendanceHistory);
  } catch (err) {
    console.error("Error in getAttendanceList:", err);
    return errorResponse(res, "Failed to fetch attendance history");
  }
};


exports.getTodayAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return errorResponse(res, "userId is required");

    const currentDate = req.query.date || moment().format("YYYY-MM-DD");

    let todayStatus = await Attendance.findOne({
      where: { userId, attendanceDate: currentDate },
    });

    const lastActive = await Attendance.findOne({
      where: {
        userId,
        active: true,
        attendanceDate: { [Op.lt]: currentDate },
      },
      order: [["attendanceDate", "DESC"]],
    });

    if (lastActive) {
      await lastActive.update({
        clockOutTime: moment(`${lastActive.attendanceDate} 23:59:59`).toISOString(),
        active: false,
        isManualOut: true,
      });
    }

    return successResponse(res, "Today's attendance fetched successfully", {
      todayStatus,
    });
  } catch (err) {
    console.error("Error in getTodayAttendance:", err);
    return errorResponse(res, "Failed to fetch today's attendance");
  }
};


// exports.getAttendanceDetails = async (req, res) => {
//   try {
//     const { userId, startDate, endDate, currentDate } = req.body;

//     if (!userId || !startDate || !endDate || !currentDate) {
//       return errorResponse(res, "userId, startDate, and endDate are required");
//     }

//     const attendanceHistory = await Attendance.findAll({
//       where: {
//         userId,
//         attendanceDate: { [Op.between]: [startDate, endDate] },
//       },
//       order: [["attendanceDate", "DESC"]],
//     });

//     // const today = new Date().toISOString().slice(0, 10);
//     const todayStatus = await Attendance.findOne({
//       where: { userId, attendanceDate: currentDate },
//     });

//     return successResponse(res, "Attendance data fetched successfully", {
//       attendanceHistory,
//       todayStatus,
//     });
//   } catch (err) {
//     console.error("Error in getAttendanceDetails:", err);
//     return errorResponse(res, "Failed to fetch attendance details");
//   }
// };

// =================================
// 🕒 Clock In / Clock Out
// actionType: 'clock-in' | 'clock-out'
// =================================
exports.clockAction = async (req, res) => {
  try {
    const { userId, actionType , currentDate , currentTime} = req.body;

    console.log(currentTime,'currentTime')

    if (!userId || !actionType || !currentDate || !currentTime) {
      return errorResponse(res, "userId,currentDate,actionType,currentTime are required");
    }

    let attendance = await Attendance.findOne({
      where: { userId, attendanceDate: currentDate },
    });

    if (actionType === "clock-in") {
      if (attendance && attendance.clockInTime) {
        return errorResponse(res, "Already clocked in for today");
      }

      console.log({
        userId,
        attendanceDate: currentDate,
        clockInTime: currentTime,
        active: true,
      },'hh')

      attendance = await Attendance.create({
        userId,
        attendanceDate: currentDate,
        clockInTime: currentTime,
        active: true,
      });

      return successResponse(res, "Clocked in successfully", attendance);
    }

    if (actionType === "clock-out") {
      if (!attendance || !attendance.clockInTime) {
        return errorResponse(res, "Cannot clock out before clocking in");
      }

      if (attendance.clockOutTime) {
        return errorResponse(res, "Already clocked out for today");
      }


      await attendance.update({
        clockOutTime: currentTime,
        active: false,
        isManualOut: false,
      });

      return successResponse(res, "Clocked out successfully", attendance);
    }

    return errorResponse(res, "Invalid action type");
  } catch (err) {
    console.error("Error in clockAction:", err);
    return errorResponse(res, "Failed to perform clock action");
  }
};
