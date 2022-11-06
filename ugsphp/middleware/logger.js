module.exports = (req, res, next) => {
  // eslint-disable-next-line no-console
  console.info(`${req.method} ${req.url}`);

  next();
};
