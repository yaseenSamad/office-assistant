const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const verifyToken = require("../middleware/auth.middleware");
const avatarUpload = require("../middleware/avatarUpload");

router.post("/", userController.createUser);
router.get("/", verifyToken, userController.getUsers);
router.get("/upcoming-birthdays", verifyToken, userController.getUpcomingBirthdays);
router.get("/:id", verifyToken, userController.getUserById);
router.put("/:id", verifyToken, avatarUpload.single('profilePicture'), userController.updateUser);
router.delete("/:id", verifyToken, userController.deleteUser);

module.exports = router;
