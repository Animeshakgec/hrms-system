'use strict';

const swaggerJsdoc = require('swagger-jsdoc');

const getServerUrl = () => {
    const baseUrl =
        process.env.API_URL ||
        `http://localhost:${process.env.PORT || 5000}`;

    return `${baseUrl}/api/v1`;
};

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'HRMS API',
            version: '1.0.0',
            description:
                'RESTful API for the HRMS',
            contact: { name: 'HRMS' },
        },
        servers: [
            {
                // url: `http://localhost:${process.env.PORT || 5000}/api/v1`,
                // description: 'Local development server',
                url: getServerUrl(),
                description: process.env.NODE_ENV === 'production'
                    ? 'Production server'
                    : 'Local development server'
            },
        ],
        tags: [
            { name: 'Employees', description: 'Employee management endpoints' },
            { name: 'Attendance', description: 'Attendance tracking endpoints' },
        ],
        components: {
            schemas: {
                Employee: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        employeeId: { type: 'string', example: 'EMP-001' },
                        fullName: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', format: 'email', example: 'john.doe@company.com' },
                        department: { type: 'string', example: 'Engineering' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Attendance: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        employeeId: { type: 'integer', example: 1 },
                        date: { type: 'string', format: 'date', example: '2024-07-15' },
                        status: { type: 'string', enum: ['Present', 'Absent'], example: 'Present' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Validation failed' },
                        errors: { type: 'array', items: { type: 'string' } },
                    },
                },
            },
        },
    },
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
