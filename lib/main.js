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
const inquirer = require("inquirer");
const path = require("path");

const settings = require("./settings");
const helpers = require("./helpers");

const template_file = path.normalize(__dirname + "/../templates/template.pug");
const PDF_SETTINGS = {
  format: "letter",
  orientation: "landscape"
};


/**
 * Will run on first use or when use runs "receipt-gen edit"
 * @param {object} settings The current options (if any exist)
 */ 
const edit_settings = (settings) => {
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
    "name": "receipt_destination",
    "message": "Receipt Destination: "
  }
  if (settings.receipt_destination) {
    dest_question.default = settings.receipt_destination;
  }

  return inquirer.prompt([company_question, phone_question, email_question, dest_question])
};

const get_receipt_details = () => {
  const receipient_name_question = {
    "type": "input",
    "name": "receipient_name",
    "message": "Customer Name: "
  };

  const transactions_question = {
    "type": "input",
    "name": "transactions",
    "message": "Please input the transactions in form of `Item1|amount1,Item2|amount2`: "
  };

  var promises = [
    settings.getSettings(),
    inquirer.prompt([receipient_name_question, transactions_question])
  ];
  return Promise.all(promises).then((promise_results) => {
    var settings = promise_results[0];
    const answers = promise_results[1];

    settings.recipient_name = answers.receipient_name;
    settings.transactions = _.reduce(answers.transactions.split(","), (acc, item) => {
      // produces [description, price]
      const components = item.split("|");
      acc.push({
        description: components[0],
        amount: parseInt(components[1])
      });
      return acc;
    }, []);

    return settings;
  }).catch((err) => {
    console.log(err);
    console.log(err.stack);
  });
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
    "phone": options.company_phone,
    "email": options.company_email,
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

  const filename = options.receipt_destination + date + "." + options.receipt_number + ".pdf";

  // Save Receipt
  return new Promise((resolve, reject) => {
    pdf.create(template, PDF_SETTINGS).toFile(filename, (err, res) => {
      if (err) {
        console.error("\x1b[31m", "Error: ", err);
        return reject(err);
      }
      return resolve({
        filename: filename,
        pdf_create: res,
        receipt_number: options.receipt_number  
      });
    });
  });
};

/**
 * The main process that is executed to create a receipt.
 */
exports.run = (should_edit) => {
  console.log("\x1b[33m", "Let's get crackin'!");

  //check for the "edit" arg.
  //else print out usage and begin
  settings.getSettings().then((receipt_settings) => {
    if (should_edit) {
      //console.log("\x1b[33m", "Editing your company information...");
      return edit_settings(receipt_settings).then(settings.createSettingsFile).then(() => {
        console.log("\x1b[33m", "All done! Rerun receipt-gen to create a receipt!");
        process.exit(0);
      }).catch((err) => {
        console.log(err);
        console.log(err.stack);
        process.exit(1);
      });
    }

    console.log("\x1b[33m", "If you want to edit your company information, rerun this program with `receipt-gen edit`.");
    //prompt for receipt info: person's name, amount, etc 
    get_receipt_details().then((details) => {
      return Promise.all([generate_receipt(details), settings.incrementReceiptNumber()]);
    }).then((receipt_details) => {
      receipt_details = _.first(receipt_details);

      console.log("\x1b[32m", "All Done! Visit your new receipt at ", receipt_details.pdf_create.filename)
      process.exit(0);
    }).catch((err) => {
      console.log(err);
      console.log(err.stack);
      process.exit(1);
    });

  }).catch(() => {
    console.log("\x1b[33m", "Running first time setup...");
    edit_settings({}).then(settings.createSettingsFile).then(() => {
      console.log("\x1b[33m", "All done! Run receipt-gen again to create your first receipt!");
      process.exit(0);
    }).catch((err) => {
      console.error("\x1b[31m", "Error creating settings configuration", err);
      process.exit(1);
    });
  });
};

module.exports = exports;

