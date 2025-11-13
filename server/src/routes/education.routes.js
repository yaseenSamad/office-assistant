const express = require("express");
const router = express.Router();
const educationController = require("../controllers/education.controller");

router.post("/:userId", educationController.createEducation);
router.put("/:id", educationController.updateEducation);
router.delete("/:id", educationController.deleteEducation);

module.exports = router;
