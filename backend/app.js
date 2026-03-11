'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const swaggerUi = require('swagger-ui-express');

const logger = require('./utils/logger');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

const employeeRouter = require('./routes/employee.routes');
const attendanceRouter = require('./routes/attendance.routes');

const app = express();

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);

app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

//app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

//log
app.use(pinoHttp({ logger, autoLogging: process.env.NODE_ENV !== 'test' }));

//swagger [api docs
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'HRMS API Docs',
        customCss: '.swagger-ui .topbar { display: none }',
    })
);
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// rouytes
const BASE_url = '/api/v1';
app.use(`${BASE_url}/employees`, employeeRouter);
app.use(`${BASE_url}/attendance`, attendanceRouter);

app.use(notFound);
app.use(errorHandler);
module.exports = app;
