![Project Logo](Receipt_Gen_Logo.png)

# Receipt Gen

This is intended to be an easy-to-use receipt generator. Simply edit the usage file and run the program. You can also use the usage file as a guide on how to integrate this with a larger program.

## Setup

Check to make sure you have the latest npm and node versions.

```
npm install
cp .settings-example .settings
cp sample-usage.js usage.js
```

## Usage

Edit the usage.js file to fit your needs. When you're ready to generate a receipt, run the following:

```
node usage.js
```

## Requirements

I wanted to write a couple of requirements to brainstorm on the various usages.

- [x] I would like to provide a company name

- [x] I would like to provide an address, email, and phone number on the receipt.

- [x] I would like the program to include todays date.

- [x] I would like a receipt number that automatically increments.

- [x] I would like to specify the destination for the receipt

- [x] I would like to specify the recipent for the receipt.

- [x] I would like to be able to provide an array to generate a table of receipt info

