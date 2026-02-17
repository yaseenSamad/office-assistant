const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payroll.controller');
const verifyToken = require('../middleware/auth.middleware');

// HR/Admin Routes
router.post('/run', verifyToken, payrollController.runPayroll);
router.get('/', verifyToken, payrollController.getPayslips);

// Employee + HR/Admin Routes
router.get('/my-payslips', verifyToken, payrollController.getMyPayslips);
router.get('/:payslipId', verifyToken, payrollController.getPayslipById);


module.exports = router;
