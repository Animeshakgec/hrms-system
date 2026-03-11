'use strict';

const { Op } = require('sequelize');
const { Attendance, Employee } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

// GET /attendance
const getAllAttendance = async (req, res, next) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    const where = {};

    if (employeeId) where.employeeId = parseInt(employeeId, 10);
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate) where.date[Op.lte] = endDate;
    }

    const records = await Attendance.findAll({
      where,
      include: [{ model: Employee, as: 'employee', attributes: ['id', 'employeeId', 'fullName', 'department'] }],
      order: [['date', 'DESC']],
    });

    return sendSuccess(res, records, 'Attendance records fetched successfully');
  } catch (err) {
    next(err);
  }
};

// GET /attendance/employee/:id
const getAttendanceByEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return sendError(res, 'Employee not found', 404);

    const { startDate, endDate } = req.query;
    const where = { employeeId: req.params.id };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate) where.date[Op.lte] = endDate;
    }

    const records = await Attendance.findAll({ where, order: [['date', 'DESC']] });
    return sendSuccess(res, { employee, records }, 'Attendance records fetched successfully');
  } catch (err) {
    next(err);
  }
};

// POST /attendance
const markAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status } = req.body;

    const employee = await Employee.findByPk(employeeId);
    if (!employee) return sendError(res, 'Employee not found', 404);

    // allow only one record per employee per day
    const [record, created] = await Attendance.findOrCreate({
      where: { employeeId, date },
      defaults: { status },
    });

    if (!created) {
      await record.update({ status });
    }

    logger.info({ employeeId, date, status }, created ? 'Attendance marked' : 'Attendance updated');

    return sendSuccess(
      res,
      record,
      created ? 'Attendance marked successfully' : 'Attendance updated successfully',
      created ? 201 : 200
    );
  } catch (err) {
    next(err);
  }
};

// DELETE /attendance/:id
const deleteAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByPk(req.params.id);
    if (!record) return sendError(res, 'Attendance record not found', 404);

    await record.destroy();
    return sendSuccess(res, null, 'Attendance record deleted successfully');
  } catch (err) {
    next(err);
  }
};

// GET /attendance/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [totalEmployees, presentToday, absentToday] = await Promise.all([
      Employee.count(),
      Attendance.count({ where: { date: today, status: 'Present' } }),
      Attendance.count({ where: { date: today, status: 'Absent' } }),
    ]);

    return sendSuccess(
      res,
      {
        totalEmployees,
        todayAttendance: {
          date: today,
          present: presentToday,
          absent: absentToday,
          notMarked: totalEmployees - presentToday - absentToday,
        },
      },
      'Dashboard stats fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllAttendance,
  getAttendanceByEmployee,
  markAttendance,
  deleteAttendance,
  getDashboardStats,
};
