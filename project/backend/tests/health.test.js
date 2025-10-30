const request = require('supertest');
const { healthCheck } = require('../src/server');

// Mock Express app for testing
const express = require('express');
const app = express();
app.get('/api/health', healthCheck);

describe('GET /api/health', () => {
  it('should return status OK', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
  });
});