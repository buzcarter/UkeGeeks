const { meta } = require('../configs/server.json');

module.exports = (req, res, next) => {
  res.locals = {
    ...meta,
    isDev: process.env.NODE_ENV !== 'production',
    EditUri: '#EditUri',
    StaticsPrefix: 'http://localhost:3034',
  };

  next();
};
