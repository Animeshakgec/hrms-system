'use strict';

const { z } = require('zod');

//Employee 
const createEmployeeSchema = z.object({
  body: z.object({
    employeeId: z
      .string({ required_error: 'Employee ID is required' })
      .min(1, 'Employee ID cannot be empty')
      .max(20, 'Employee ID must be at most 20 characters'),
    fullName: z
      .string({ required_error: 'Full name is required' })
      .min(2, 'Full name must be at least 2 characters')
      .max(150, 'Full name must be at most 150 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Must be a valid email address')
      .max(255),
    department: z
      .string({ required_error: 'Department is required' })
      .min(1, 'Department cannot be empty')
      .max(100, 'Department must be at most 100 characters'),
  }),
});

const employeeIdParamSchema = z.object({
  params: z.object({
    id: z.coerce
      .number({ invalid_type_error: 'Employee ID must be a number' })
      .int()
      .positive('Employee ID must be a positive integer'),
  }),
});

//Attendance

const markAttendanceSchema = z.object({
  body: z.object({
    employeeId: z.coerce
      .number({ required_error: 'Employee ID is required' })
      .int()
      .positive('Employee ID must be a positive integer'),
    date: z
      .string({ required_error: 'Date is required' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    status: z.enum(['Present', 'Absent'], {
      errorMap: () => ({ message: 'Status must be either Present or Absent' }),
    }),
  }),
});

const attendanceQuerySchema = z.object({
  query: z.object({
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be in YYYY-MM-DD format')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be in YYYY-MM-DD format')
      .optional(),
  }),
});

module.exports = {
  createEmployeeSchema,
  employeeIdParamSchema,
  markAttendanceSchema,
  attendanceQuerySchema,
};
