'use strict';

process.env.NODE_ENV = 'test';

const { connectDB } = require('../config/database');

before(async function () {
  this.timeout(20000);
  await connectDB();
});
