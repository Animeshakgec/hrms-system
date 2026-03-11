'use strict';

const { Op } = require('sequelize');
const { Employee, Attendance } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

// GET /employees
const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.findAll({ order: [['createdAt', 'DESC']] });
    return sendSuccess(res, employees, 'Employees fetched successfully');
  } catch (err) {
    next(err);
  }
};

// GET /employees/:id
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return sendError(res, 'Employee not found', 404);
    return sendSuccess(res, employee, 'Employee fetched successfully');
  } catch (err) {
    next(err);
  }
};

// POST /employees
const createEmployee = async (req, res, next) => {
  try {
    const { employeeId, fullName, email, department } = req.body;

    // Manual duplicate checks with clear messages
    const existingId = await Employee.findOne({ where: { employeeId } });
    if (existingId) return sendError(res, `Employee ID '${employeeId}' already exists`, 409);

    const existingEmail = await Employee.findOne({ where: { email: { [Op.iLike]: email } } });
    if (existingEmail) return sendError(res, `Email '${email}' is already registered`, 409);

    const employee = await Employee.create({ employeeId, fullName, email, department });
    logger.info({ employeeId: employee.id }, 'Employee created');
    return sendSuccess(res, employee, 'Employee created successfully', 201);
  } catch (err) {
    next(err);
  }
};

// DELETE /employees/:id
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return sendError(res, 'Employee not found', 404);

    await employee.destroy();
    logger.info({ employeeId: req.params.id }, 'Employee deleted');
    return sendSuccess(res, null, 'Employee deleted successfully');
  } catch (err) {
    next(err);
  }
};

// GET /employees/:id/attendance-summary
const getAttendanceSummary = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return sendError(res, 'Employee not found', 404);

    const [presentCount, absentCount] = await Promise.all([
      Attendance.count({ where: { employeeId: req.params.id, status: 'Present' } }),
      Attendance.count({ where: { employeeId: req.params.id, status: 'Absent' } }),
    ]);

    return sendSuccess(
      res,
      {
        employee,
        summary: {
          totalPresent: presentCount,
          totalAbsent: absentCount,
          totalDays: presentCount + absentCount,
        },
      },
      'Attendance summary fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  deleteEmployee,
  getAttendanceSummary,
};
