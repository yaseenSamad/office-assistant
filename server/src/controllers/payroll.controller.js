const { User, Salary, Attendance, Payslip, sequelize } = require("../models");
const { errorResponse, successResponse } = require("../utils/response");
const { Op } = require("sequelize");
const moment = require("moment");

exports.runPayroll = async (req, res) => {
    // Authorization: Admin only
    if (req.user.role !== 'admin') {
        return errorResponse(res, "Access denied. You must be an Admin.", 403);
    }

    const { payPeriodStart, payPeriodEnd } = req.body;
    if (!payPeriodStart || !payPeriodEnd) {
        return errorResponse(res, "payPeriodStart and payPeriodEnd are required.", 400);
    }

    const start = moment(payPeriodStart);
    const end = moment(payPeriodEnd).add(1, "days");
    const monthsCount = end.diff(start, "months", true);

    const transaction = await sequelize.transaction();

    try {
        const users = await User.findAll({ where: { role: { [Op.ne]: 'admin' } } }); // Don't run payroll for admins
        let payslipsCreated = 0;

        for (const user of users) {
            const salary = await Salary.findOne({ where: { userId: user.userId } });

            if (!salary) {
                console.warn(`Skipping user ${user.username}: No salary information found.`);
                continue;
            }

            let grossSalary = 0;

            if (salary.payType === 'monthly') {
                grossSalary = parseFloat(salary.amount) * monthsCount;
            } else if (salary.payType === 'hourly') {
                const attendances = await Attendance.findAll({
                    where: {
                        userId: user.userId,
                        checkInTime: { [Op.between]: [payPeriodStart, payPeriodEnd] }
                    }
                });

                let totalHours = 0;
                attendances.forEach(att => {
                    if (att.checkInTime && att.checkOutTime) {
                        const checkIn = moment(att.checkInTime);
                        const checkOut = moment(att.checkOutTime);
                        totalHours += checkOut.diff(checkIn, 'hours', true); // Use true for floating point
                    }
                });
                grossSalary = totalHours * parseFloat(salary.amount);
            }

            if (grossSalary > 0) {
                const deductions = grossSalary * 0.10; // Simplified 10% tax
                const netSalary = grossSalary - deductions;

                await Payslip.create({
                    userId: user.userId,
                    payPeriodStart,
                    payPeriodEnd,
                    grossSalary: grossSalary.toFixed(2),
                    deductions: deductions.toFixed(2),
                    netSalary: netSalary.toFixed(2),
                    status: 'unpaid'
                }, { transaction });

                payslipsCreated++;
            }
        }

        await transaction.commit();
        return successResponse(res, "Payroll run completed successfully.", { payslipsCreated });

    } catch (err) {
        await transaction.rollback();
        console.error("Payroll run failed:", err);
        return errorResponse(res, "Payroll run failed.");
    }
};

// Get all payslips (for HR/Admin)
exports.getPayslips = async (req, res) => {
    // Authorization: HR or Admin only
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
        return errorResponse(res, "Access denied. You must be an Admin or HR.", 403);
    }

    try {
        const payslips = await Payslip.findAll({
            include: [{ model: User, as: 'user', attributes: ['userId', 'firstName', 'lastName'] }],
            order: [['payPeriodEnd', 'DESC']]
        });
        return successResponse(res, "All payslips fetched successfully.", payslips);
    } catch (err) {
        console.error("Error fetching payslips:", err);
        return errorResponse(res, "Failed to fetch payslips.");
    }
};

// Get payslips for the logged-in user
exports.getMyPayslips = async (req, res) => {
    try {
        const payslips = await Payslip.findAll({
            where: { userId: req.user.userId },
            order: [['payPeriodEnd', 'DESC']]
        });
        return successResponse(res, "Your payslips fetched successfully.", payslips);
    } catch (err) {
        console.error("Error fetching personal payslips:", err);
        return errorResponse(res, "Failed to fetch your payslips.");
    }
};

// Get a single payslip by its ID
exports.getPayslipById = async (req, res) => {
    try {
        const { payslipId } = req.params;
        const payslip = await Payslip.findByPk(payslipId, {
            include: [{ model: User, as: 'user', attributes: ['userId', 'firstName', 'lastName', 'department', 'designation'] }]
        });

        if (!payslip) {
            return errorResponse(res, "Payslip not found.", 404);
        }

        // Authorization: Allow if Admin, HR, or the user who owns the payslip
        if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.userId !== payslip.userId) {
            return errorResponse(res, "Access denied.", 403);
        }

        return successResponse(res, "Payslip details fetched successfully.", payslip);
    } catch (err) {
        console.error("Error fetching payslip details:", err);
        return errorResponse(res, "Failed to fetch payslip details.");
    }
};
