'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Employee = sequelize.define(
  'Employee',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: { name: 'unique_employee_id', msg: 'Employee ID already exists' },
      field: 'employee_id',
    },
    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'full_name',
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: { name: 'unique_email', msg: 'Email address already exists' },
      validate: { isEmail: { msg: 'Must be a valid email address' } },
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: 'employees',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Employee;
