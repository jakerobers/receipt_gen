//////////////
//  Colors  //
//////////////
/**
Reset = "\x1b[0m"
Bright = "\x1b[1m"
Dim = "\x1b[2m"
Underscore = "\x1b[4m"
Blink = "\x1b[5m"
Reverse = "\x1b[7m"
Hidden = "\x1b[8m"

FgBlack = "\x1b[30m"
FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgMagenta = "\x1b[35m"
FgCyan = "\x1b[36m"
FgWhite = "\x1b[37m"

BgBlack = "\x1b[40m"
BgRed = "\x1b[41m"
BgGreen = "\x1b[42m"
BgYellow = "\x1b[43m"
BgBlue = "\x1b[44m"
BgMagenta = "\x1b[45m"
BgCyan = "\x1b[46m"
BgWhite = "\x1b[47m"
**/

////////////////
//  Packages  //
////////////////
const pug = require("pug");
const pdf = require("html-pdf");
const Promise = require("promise");
const jsonfile = require("jsonfile");
const _ = require("underscore");

const SETTINGS_FILE = "./.settings";
const PDF_SETTINGS = {
  format: "letter",
  orientation: "landscape"
};

var exports = {};

////////////////////////
//  Helper functions  //
////////////////////////

/**
 * Gets the date in "YYYY-MM-DD" format.
 * @return {string} Date in YYYY-MM-DD
 */
exports.getDate = () => {
  return new Date().toISOString().slice(0,10);
}

/**
 * Reads the .settings file, returns the receipt_number, and increments.
 * @return {number} The receipt number.
 */
exports.getReceiptNumber = () => {
  // Read the file
  return new Promise((resolve, reject) => {
    jsonfile.readFile(SETTINGS_FILE, (err, obj) => {
      if (err) {
        return reject(err);
      }
      return resolve(obj);
    });
  })
  // Write the file
  .then((settings) => {
    return new Promise((resolve, reject) => {
      const receipt_number = settings.receipt_number;
      settings.receipt_number = settings.receipt_number + 1;

      jsonfile.writeFile(SETTINGS_FILE, settings, {spaces: 2}, (err) => {
        if (err) {
          console.error("\x1b[31m", "Error rewriting file: ", err);
          return reject(err);
        }
        return resolve(receipt_number);
      });
    });
  });
}


/**
 * The main process that is executed to create a receipt.
 * @param {array} options.transactions The list of transactions in the form:
 * [{
 *  "description": "This is a description",
 *  "amount": 800
 *  }, ...]
 *  @param {string} options.company_name The company name
 *  @param {string} options.phone The phone number
 *  @param {string} options.email The email
 *  @param {string} options.recipient_name The name of the receipt recipient
 */
exports.main = (options) => {
  // Create receipt
  const compiler = pug.compileFile("template.pug");

  //use .all in case we have additional promised-based values in the future.
  Promise.all([exports.getReceiptNumber()]).then((receipt_number) => {
    const total = _.reduce(transactions, (acc, e) => {
      acc = acc + e.amount;
      return acc;
    }, 0);

    const date = exports.getDate();

    return {
      template: compiler({
        company_name: options.company_name,
        phone: options.phone,
        email: options.email,
        date: date,
        receipt_number: receipt_number,
        recipient_name: options.recipient_name,
        transactions: transactions,
        total: total
      }),
      date: date,
      receipt_number: receipt_number
    };
  }).then((receipt_obj) => {
    if (!options.receipt_destination) {
      options.receipt_destination = "";
    }
    const filename = options.receipt_destination + receipt_obj.date + "." + receipt_obj.receipt_number + ".pdf";

    // Save Receipt
    return new Promise((resolve, reject) => {
      pdf.create(receipt_obj.template, PDF_SETTINGS).toFile(filename, (err, res) => {
        if (err) {
          console.error("\x1b[31m", "Error: ", err);
          return reject(err);
        }
        return resolve(res);
      });
    });
  });
};

module.exports = exports;

