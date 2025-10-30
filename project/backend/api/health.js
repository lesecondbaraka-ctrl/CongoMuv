const { healthCheck } = require('../src/server');

// Export the serverless function
module.exports = async (req, res) => {
  await healthCheck(req, res);
};