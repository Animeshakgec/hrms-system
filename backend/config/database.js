'use strict';
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'hrms',
    process.env.DB_USER || 'postgres_database',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        dialect: 'postgres',
        logging: (msg) => logger.debug(msg),
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        // dialectOptions:
        //     process.env.NODE_ENV === 'production'
        //         ? { ssl: { require: true, rejectUnauthorized: false } }
        //         : {},
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },

    }
);

const connectDB = async () => {
    await sequelize.authenticate();
    logger.info('PostgreSQL connected successfully');
    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    logger.info('Database models synchronised');
};

module.exports = { sequelize, connectDB };
