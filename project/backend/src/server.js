const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initializeDatabase } = require('./config/database');
require('dotenv').config();

// Middleware configuration
const configureMiddlewares = (app) => {
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
  }));
};

// Example of a serverless function for the health check
const healthCheck = async (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
};

// Example of a serverless function for initializing the database
const initializeServices = async () => {
  try {
    if (String(process.env.DB_SKIP_INIT || '').toLowerCase() !== 'true') {
      await initializeDatabase();
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Export serverless functions
module.exports = {
  healthCheck,
  initializeServices,
};
