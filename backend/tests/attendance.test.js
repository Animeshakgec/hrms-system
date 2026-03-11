'use strict';

const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');

describe('Attendance API', () => {
  let employeeId;

  before(async () => {
    // Create a fresh employee for attendance tests
    const res = await request(app).post('/api/v1/employees').send({
      employeeId: 'ATT-TEST-01',
      fullName: 'Bob Attendance',
      email: 'bob.attendance@company.com',
      department: 'HR',
    });
    employeeId = res.body.data?.id;
  });

  after(async () => {
    if (employeeId) {
      await request(app).delete(`/api/v1/employees/${employeeId}`);
    }
  });

  describe('POST /api/v1/attendance', () => {
    it('should mark attendance as Present', async () => {
      const res = await request(app).post('/api/v1/attendance').send({
        employeeId,
        date: '2024-07-15',
        status: 'Present',
      });
      expect(res.status).to.equal(201);
      expect(res.body.data.status).to.equal('Present');
    });

    it('should update existing attendance (upsert)', async () => {
      const res = await request(app).post('/api/v1/attendance').send({
        employeeId,
        date: '2024-07-15',
        status: 'Absent',
      });
      expect(res.status).to.equal(200);
      expect(res.body.data.status).to.equal('Absent');
    });

    it('should reject invalid status value', async () => {
      const res = await request(app).post('/api/v1/attendance').send({
        employeeId,
        date: '2024-07-16',
        status: 'Late',
      });
      expect(res.status).to.equal(422);
    });

    it('should reject invalid date format', async () => {
      const res = await request(app).post('/api/v1/attendance').send({
        employeeId,
        date: '15-07-2024',
        status: 'Present',
      });
      expect(res.status).to.equal(422);
    });

    it('should return 404 for non-existent employee', async () => {
      const res = await request(app).post('/api/v1/attendance').send({
        employeeId: 999999,
        date: '2024-07-15',
        status: 'Present',
      });
      expect(res.status).to.equal(404);
    });
  });

  describe('GET /api/v1/attendance', () => {
    it('should return all attendance records', async () => {
      const res = await request(app).get('/api/v1/attendance');
      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an('array');
    });

    it('should filter by date range', async () => {
      const res = await request(app)
        .get('/api/v1/attendance')
        .query({ startDate: '2024-07-01', endDate: '2024-07-31' });
      expect(res.status).to.equal(200);
    });
  });

  describe('GET /api/v1/attendance/employee/:id', () => {
    it("should return an employee's attendance records", async () => {
      const res = await request(app).get(`/api/v1/attendance/employee/${employeeId}`);
      expect(res.status).to.equal(200);
      expect(res.body.data).to.have.property('records');
      expect(res.body.data.records).to.be.an('array');
    });

    it('should return 404 for non-existent employee', async () => {
      const res = await request(app).get('/api/v1/attendance/employee/999999');
      expect(res.status).to.equal(404);
    });
  });

  describe('GET /api/v1/attendance/dashboard', () => {
    it('should return dashboard statistics', async () => {
      const res = await request(app).get('/api/v1/attendance/dashboard');
      expect(res.status).to.equal(200);
      expect(res.body.data).to.have.property('totalEmployees');
      expect(res.body.data).to.have.property('todayAttendance');
    });
  });
});
