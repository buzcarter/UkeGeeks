const RegExes = {
  LEAD_CHAR: /\b[a-z]/g,
};

module.exports = {
  properCase(value) {
    return `${value}`.replace(RegExes.LEAD_CHAR, (letter) => letter.toUpperCase());
  },
};
