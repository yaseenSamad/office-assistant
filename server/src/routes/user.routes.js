const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");


const avatarUpload = require("../middleware/avatarUpload");

router.post("/", userController.createUser);
router.get("/", userController.getUsers);
router.get("/upcoming-birthdays", userController.getUpcomingBirthdays);
router.get("/:id", userController.getUserById);
router.put("/:id", avatarUpload.single('profilePicture'), userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
