const { usersRoutes } = require('../src/routes/users');

module.exports = async (req, res) => {
  await usersRoutes(req, res);
};