'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/attendance.controller');
const validate = require('../middlewares/validate');
const {
  markAttendanceSchema,
  employeeIdParamSchema,
  attendanceQuerySchema,
} = require('../validations/schemas');

const router = Router();

/**
 * @swagger
 * /attendance/dashboard:
 *   get:
 *     summary: Get dashboard stats (total employees, today's attendance)
 *     tags: [Attendance]
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/dashboard', ctrl.getDashboardStats);

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: Get all attendance records (with optional filters)
 *     tags: [Attendance]
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema: { type: integer }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: List of attendance records
 */
router.get('/', ctrl.getAllAttendance);

/**
 * @swagger
 * /attendance/employee/{id}:
 *   get:
 *     summary: Get attendance records for a specific employee
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Employee attendance records
 *       404:
 *         description: Employee not found
 */
router.get(
  '/employee/:id',
  validate(employeeIdParamSchema),
  ctrl.getAttendanceByEmployee
);

/**
 * @swagger
 * /attendance:
 *   post:
 *     summary: Mark or update attendance for an employee
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, date, status]
 *             properties:
 *               employeeId: { type: integer, example: 1 }
 *               date: { type: string, format: date, example: '2024-07-15' }
 *               status: { type: string, enum: [Present, Absent] }
 *     responses:
 *       201:
 *         description: Attendance marked
 *       200:
 *         description: Attendance updated
 *       404:
 *         description: Employee not found
 *       422:
 *         description: Validation error
 */
router.post('/', validate(markAttendanceSchema), ctrl.markAttendance);

/**
 * @swagger
 * /attendance/{id}:
 *   delete:
 *     summary: Delete an attendance record
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Record deleted
 *       404:
 *         description: Record not found
 */
router.delete('/:id', ctrl.deleteAttendance);

module.exports = router;
