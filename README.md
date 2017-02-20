![Project Logo](/Receipt_Gen_Logo.svg)

# Receipt Gen

This is intended to be an easy-to-use receipt generator. Simply edit the usage file and run the program. You can also use the usage file as a guide on how to integrate this with a larger program.

## Setup

Check to make sure you have the latest npm and node versions.

```
npm install
cp .settings-example .settings
```

## Usage

You will notice there is a usage.js file. Edit this to fit your needs. When you're ready to generate a receipt, run the following:

```
cat usage.js | node
```

## User Stories

I wanted to write a couple of user stories to brainstorm on the various usages.

- [x] As a user, I would like to provide a company name

- [x] As a user, I would like to provide an address, email, and phone number on the receipt.

- [x] As a user, I would like the program to include todays date.

- [x] As a user, I would like a receipt number that automatically increments.

- [x] As a user, I would like to specify the destination for the receipt

- [x] As a user, I would like to specify the recipent for the receipt.

- [x] As a user, I would like to be able to provide an array to generate a table of receipt info

