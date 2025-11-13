const express = require("express");
const router = express.Router();
const workExperienceController = require("../controllers/work_experience.controller");

router.post("/:userId", workExperienceController.createWorkExperience);
router.put("/:id", workExperienceController.updateWorkExperience);
router.delete("/:id", workExperienceController.deleteWorkExperience);

module.exports = router;
