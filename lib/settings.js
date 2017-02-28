var exports = {};

const jsonfile = require("jsonfile");

const SETTINGS_FILE = "../.settings";
const SETTINGS_CONFIG = {spaces: 2};

exports.createSettingsFile = (settings) => {
  if (!settings.receipt_number) {
    settings.receipt_number = 1000;
  }

  return new Promise((resolve, reject) => {
    jsonfile.writeFile(SETTINGS_FILE, settings, SETTINGS_CONFIG, (err) => {
      if (err) {
        console.error("\x1b[31m", "Error rewriting file: ", err);
        return reject(err);
      }
      return resolve();
    });
  });
};

/**
 * Reads the .settings file, returns the receipt_number, and increments.
 * @return {number} The receipt number.
 */
exports.getSettings = () => {
  // Read the file
  return new Promise((resolve, reject) => {
    jsonfile.readFile(SETTINGS_FILE, (err, obj) => {
      if (err) {
        return reject(err);
      }
      return resolve(obj);
    });
  });
};

/**
 * Increments the receipt number. Should be used after proper generation of the receipt.
 * @return {Promise} The promise resolves with the next receipt number.
 */
exports.incrementReceiptNumber = () => {
  return new Promise((resolve, reject) => {
    return exports.getSettings().then((settings) => {
      settings.receipt_number = settings.receipt_number + 1;
      jsonfile.writeFile(SETTINGS_FILE, settings, SETTINGS_CONFIG, (err) => {
        if (err) {
          console.error("\x1b[31m", "Error rewriting file: ", err);
          return reject(err);
        }
        return resolve(settings.receipt_number);
      });
    });
  });
}

module.exports = exports;

