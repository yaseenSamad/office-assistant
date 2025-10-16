const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendance.controller");

router.post("/list", attendanceController.getAttendanceList);
router.get("/today/:userId", attendanceController.getTodayAttendance);
router.patch("/action", attendanceController.clockAction);

module.exports = router;
