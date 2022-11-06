const { meta } = require('../configs/server.json');

module.exports = (req, res, next) => {
  res.locals = {
    ...meta,
    EditUri: '#EditUri',
    StaticsPrefix: 'http://localhost:3034',
  };

  next();
};
