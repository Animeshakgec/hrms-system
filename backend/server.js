'use strict';

require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');

const PORT = parseInt(process.env.PORT, 10) || 5000;

const start = async () => {
    try {
        await connectDB();
        const host = process.env.NODE_ENV === 'production'
            ? process.env.API_URL                        // e.g. https://hrms-api.onrender.com
            : `http://localhost:${PORT}`;

        const server = app.listen(PORT, () => {
            // logger.info(`HRMS API running on http://localhost:${PORT}`);
            // logger.info(`Swagger docs at  http://localhost:${PORT}/api-docs`);
            logger.info(`HRMS API running on ${host}`);
            logger.info(`Swagger docs at ${host}/api-docs`);
        });

        // Graceful shutdown
        const shutdown = (signal) => {
            logger.info(`${signal} received – shutting down gracefully`);
            server.close(() => {
                logger.info('HTTP server closed');
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    } catch (err) {
        logger.error(err, 'Failed to start server');
        process.exit(1);
    }
};

start();
