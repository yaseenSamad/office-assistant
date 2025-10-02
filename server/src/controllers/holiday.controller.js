const { Holiday,sequelize  } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");
const { Op, fn, col } = require("sequelize");

exports.createHoliday = async (req, res) => {
  try {
    const { holDate, holName, isFloater, description } = req.body;

    if (!holDate || !holName) {
      return errorResponse(res, "Holiday Date and Name are required", 400);
    }

    const holiday = await Holiday.create({ holDate, holName , isFloater, description });

    return successResponse(res, "Holiday created successfully", holiday);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to create holiday", 500);
  }
};

exports.patchHoliday = async (req, res) => {
  try {
    const { holId } = req.params;
    const { holDate, holName,isFloater,description } = req.body;

    const holiday = await Holiday.findByPk(holId);
    if (!holiday) {
      return errorResponse(res, "Holiday not found", 404);
    }

    // Only update fields if provided
    if (holDate !== undefined) holiday.holDate = holDate;
    if (holName !== undefined) holiday.holName = holName;
    holiday.isFloater = isFloater;
    holiday.description = description

    await holiday.save();

    return successResponse(res, "Holiday updated successfully", holiday);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to update holiday", 500);
  }
};


exports.deleteHoliday = async (req, res) => {
  try {
    const { holId } = req.params;

    const deleted = await Holiday.destroy({ where: { holId } });

    if (!deleted) {
      return errorResponse(res, "Holiday not found", 404);
    }

    return successResponse(res, "Holiday deleted successfully");
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to delete holiday", 500);
  }
};

exports.getHolidaysByYear = async (req, res) => {
  try {
    const { year } = req.query;

    if (!year || isNaN(year)) {
      return errorResponse(res, "Valid year query param is required", 400);
    }

    const holidays = await Holiday.findAll({
      where: sequelize.where(
        sequelize.fn("YEAR", sequelize.col("holDate")),
        year
      ),
      order: [["holDate", "ASC"]],
    });

    return successResponse(res, "Holidays fetched successfully", holidays);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to fetch holidays", 500);
  }
};
