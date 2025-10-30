const { tripsRoutes } = require('../src/routes/trips');

module.exports = async (req, res) => {
  await tripsRoutes(req, res);
};