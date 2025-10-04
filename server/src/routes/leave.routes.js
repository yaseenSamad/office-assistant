const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leave.controller");

router.post("/types/:userId", leaveController.createLeaveType);
router.get("/types", leaveController.getLeaveTypes);
router.patch("/types/:id", leaveController.updateLeaveType);
router.delete("/types/:id", leaveController.deleteLeaveType);

router.post("/requests/:userId", leaveController.applyLeave);
router.get("/requests/:userId", leaveController.getMyLeaves);
router.get("/requests/pending", leaveController.getPendingApprovals);
router.patch("/requests/:leaveId/:userId", leaveController.approveLeave);
// router.patch("/requests/:id/reject", leaveController.rejectLeaveRequest);
// router.get("/requests", leaveController.getAllLeaveRequests);

module.exports = router;
