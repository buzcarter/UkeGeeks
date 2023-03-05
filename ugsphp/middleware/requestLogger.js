const RegExes = {
  EXCLUDE_EXT: /\.(js|css|svg|png|jpe?g|gif|ico)$/,
};

module.exports = (req, res, next) => {
  const { method, url } = req;
  if (!RegExes.EXCLUDE_EXT.test(url)) {
    // eslint-disable-next-line no-console
    console.log(`${url} ${method}`);
  }
  next();
};
