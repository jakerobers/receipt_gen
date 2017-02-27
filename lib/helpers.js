var exports = {};

/**
 * Gets the date in "YYYY-MM-DD" format.
 * @return {string} Date in YYYY-MM-DD
 */
exports.getDate = () => {
  return new Date().toISOString().slice(0,10);
}

module.exports = exports;
