var exports = {};

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
const inquirer = require('inquirer');

const settings = require("./settings");
const helpers = require("./helpers");

const template_file = "../templates/template.pug";
const PDF_SETTINGS = {
  format: "letter",
  orientation: "landscape"
};

/**
 * Will run on first use or when use runs "receipt-gen edit"
 * @param {object} settings The current options (if any exist)
 */ 
const editSettings = (settings) => {
  var company_question = {
    "type": "input",
    "name": "company_name",
    "message": "Company Name: "
  }
  if (settings.company_name) {
    company_question.default = settings.company_name;
  }

  
  var phone_question = {
    "type": "input",
    "name": "company_phone",
    "message": "Company Phone Number: "
  }
  if (settings.company_phone) {
    phone_question.default = settings.company_phone;
  }


  var email_question = {
    "type": "input",
    "name": "company_email",
    "message": "Company Email: "
  }
  if (settings.company_email) {
    email_question.default = settings.company_email;
  }

  var dest_question = {
    "type": "input",
    "name": "destination",
    "message": "Receipt Destination: "
  }
  if (settings.receipt_destination) {
    dest_question.default = settings.receipt_destination;
  }

  return inquirer.prompt([company_question, phone_question, email_question, dest_question]);
};

const generate_receipt = (options) => {
  // Create receipt
  const compiler = pug.compileFile(template_file);

  const total = _.reduce(options.transactions, (acc, e) => {
    acc = acc + e.amount;
    return acc;
  }, 0);

  const date = helpers.getDate();

  const template = compiler({
    "company_name": options.company_name,
    "phone": options.phone,
    "email": options.email,
    "date": date,
    "receipt_number": options.receipt_number,
    "recipient_name": options.recipient_name,
    "transactions": options.transactions,
    "total": total
  });

  if (!options.receipt_destination) {
    options.receipt_destination = "";
  } else if (options.receipt_destination.length > 0 && options.receipt_destination.substr(options.receipt_destination.length-1) !== "/") {
    options.receipt_destination += "/"; 
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
};

/**
 * The main process that is executed to create a receipt.
 */
exports.run = (should_edit) => {
  console.log("{should_edit}: ", should_edit);
  console.log("Let's get crackin'! If you want to edit your company information, rerun this program with `receipt-gen edit`");

  //check for the "edit" arg.
  //else print out usage and begin
  settings.getSettings().then((settings) => {
    if (should_edit) {
      console.log("\x1b[33m", "Editing your company information...");
      editSettings(settings).then(settings.createSettingsFile).then(() => {
        console.log("\x1b[33m", "All done! Rerun receipt-gen to create a receipt!");
      });
    } else {
      //prompt for receipt info: person's name, amount, etc 
    }
  }).catch(() => {
    console.log("\x1b[33m", "Running first time setup...");
    editSettings({}).then(settings.createSettingsFile).then(() => {
      console.log("\x1b[33m", "All done! Run receipt-gen again to create your first receipt!");
    }).catch((err) => {
      console.error("\x1b[31m", "Error creating settings configuration", err);
    });
  });
};

module.exports = exports;

