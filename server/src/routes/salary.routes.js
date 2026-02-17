const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salary.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/:userId', verifyToken, salaryController.createOrUpdateSalary);
router.get('/:userId', verifyToken, salaryController.getSalaryByUserId);
router.delete('/:userId', verifyToken, salaryController.deleteSalary);

module.exports = router;
