'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/employee.controller');
const validate = require('../middlewares/validate');
const {
  createEmployeeSchema,
  employeeIdParamSchema,
  attendanceQuerySchema,
} = require('../validations/schemas');

const router = Router();

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 */
router.get('/', ctrl.getAllEmployees);

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     summary: Get a single employee by ID
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Employee found
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', validate(employeeIdParamSchema), ctrl.getEmployeeById);

/**
 * @swagger
 * /employees:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, fullName, email, department]
 *             properties:
 *               employeeId: { type: string, example: EMP-001 }
 *               fullName: { type: string, example: Jane Smith }
 *               email: { type: string, format: email, example: jane@company.com }
 *               department: { type: string, example: Engineering }
 *     responses:
 *       201:
 *         description: Employee created
 *       409:
 *         description: Duplicate Employee ID or Email
 *       422:
 *         description: Validation error
 */
router.post('/', validate(createEmployeeSchema), ctrl.createEmployee);

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     summary: Delete an employee
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Employee deleted
 *       404:
 *         description: Employee not found
 */
router.delete('/:id', validate(employeeIdParamSchema), ctrl.deleteEmployee);

/**
 * @swagger
 * /employees/{id}/attendance-summary:
 *   get:
 *     summary: Get attendance summary for an employee
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Attendance summary with present/absent counts
 *       404:
 *         description: Employee not found
 */
router.get(
  '/:id/attendance-summary',
  validate(employeeIdParamSchema),
  ctrl.getAttendanceSummary
);

module.exports = router;
