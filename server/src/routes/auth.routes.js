const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/login', authController.login);
router.post('/reset-password', verifyToken, authController.resetPassword);

module.exports = router;
