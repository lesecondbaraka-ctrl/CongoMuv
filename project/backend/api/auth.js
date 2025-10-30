const { authRoutes } = require('../src/routes/auth');

module.exports = async (req, res) => {
  await authRoutes(req, res);
};