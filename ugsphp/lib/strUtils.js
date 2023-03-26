const RegExes = {
  LEAD_CHAR: /\b[a-z]/g,
  SPECIAL_CHARS: /[&<>"']/g,
};

const specialCharHas = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
});

module.exports = {
  /**
   * down 'n dirty version of PHP's `htmlspecialchars`
   * @see https://www.php.net/manual/en/function.htmlspecialchars.php
   */
  htmlSpecialChars(value) {
    return `${value}`.replace(RegExes.SPECIAL_CHARS, (char) => specialCharHas[char]);
  },
  properCase(value) {
    return `${value}`.replace(RegExes.LEAD_CHAR, (letter) => letter.toUpperCase());
  },
};
