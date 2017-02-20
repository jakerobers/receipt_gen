const receiptGen = require("./main");

/////////    OPTIONS      //////////

const company_name = "My Company Name";
const phone = "(XXX) XXX-XXXX";
const email = "example@gmail.com";
const receipt_destination = "";

const recipient_name = "Billy Bob";
const transactions = [
    {
        description: "Rent",
        amount: 800
    }, {
        description: "Late Fee",
        amount: 5   
    }
];


/////////    END OPTIONS   //////////


receiptGen.main({
    company_name: company_name,
    phone: phone,
    email: email,
    recipient_name: recipient_name,
    receipt_destination: receipt_destination
});

