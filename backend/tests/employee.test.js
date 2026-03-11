'use strict';

const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');

describe('Employee API', () => {
  let createdId;

  const validEmployee = {
    employeeId: 'TEST-001',
    fullName: 'Alice Test',
    email: 'alice.test@company.com',
    department: 'Engineering',
  };

  describe('POST /api/v1/employees', () => {
    it('should create an employee successfully', async () => {
      const res = await request(app).post('/api/v1/employees').send(validEmployee);
      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.property('id');
      expect(res.body.data.employeeId).to.equal(validEmployee.employeeId);
      createdId = res.body.data.id;
    });

    it('should reject duplicate employee ID', async () => {
      const res = await request(app).post('/api/v1/employees').send(validEmployee);
      expect(res.status).to.equal(409);
      expect(res.body.success).to.be.false;
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/employees')
        .send({ ...validEmployee, employeeId: 'TEST-002' });
      expect(res.status).to.equal(409);
    });

    it('should reject an invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/employees')
        .send({ ...validEmployee, employeeId: 'TEST-003', email: 'not-an-email' });
      expect(res.status).to.equal(422);
      expect(res.body.errors).to.be.an('array');
    });

    it('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/employees')
        .send({ fullName: 'No ID' });
      expect(res.status).to.equal(422);
    });
  });

  describe('GET /api/v1/employees', () => {
    it('should return array of employees', async () => {
      const res = await request(app).get('/api/v1/employees');
      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an('array');
    });
  });

  describe('GET /api/v1/employees/:id', () => {
    it('should return a specific employee', async () => {
      const res = await request(app).get(`/api/v1/employees/${createdId}`);
      expect(res.status).to.equal(200);
      expect(res.body.data.id).to.equal(createdId);
    });

    it('should return 404 for non-existent employee', async () => {
      const res = await request(app).get('/api/v1/employees/999999');
      expect(res.status).to.equal(404);
    });

    it('should return 422 for invalid id param', async () => {
      const res = await request(app).get('/api/v1/employees/abc');
      expect(res.status).to.equal(422);
    });
  });

  describe('GET /api/v1/employees/:id/attendance-summary', () => {
    it('should return attendance summary', async () => {
      const res = await request(app).get(`/api/v1/employees/${createdId}/attendance-summary`);
      expect(res.status).to.equal(200);
      expect(res.body.data).to.have.property('summary');
      expect(res.body.data.summary).to.have.property('totalPresent');
    });
  });

  describe('DELETE /api/v1/employees/:id', () => {
    it('should delete the employee', async () => {
      const res = await request(app).delete(`/api/v1/employees/${createdId}`);
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
    });

    it('should return 404 when deleting already-deleted employee', async () => {
      const res = await request(app).delete(`/api/v1/employees/${createdId}`);
      expect(res.status).to.equal(404);
    });
  });
});
