const express = require("express");
const router = express.Router();
const holidayController = require("../controllers/holiday.controller");

router.post("/", holidayController.createHoliday);
router.delete("/:holId", holidayController.deleteHoliday);
router.get("/", holidayController.getHolidaysByYear);
router.patch("/:holId", holidayController.patchHoliday);


module.exports = router;
