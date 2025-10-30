const { bookingsRoutes } = require('../src/routes/bookings');

module.exports = async (req, res) => {
  await bookingsRoutes(req, res);
};