![Project Logo](Receipt_Gen_Logo.png)

# Receipt Gen

This is intended to be an easy-to-use receipt generator. Simply edit the usage file and run the program. You can also use the usage file as a guide on how to integrate this with a larger program.

## Setup

Check to make sure you have the latest npm and node versions.

```
npm install -g receipt-gen
```

## Usage

You will setup your company information on the first run.

```
receipt-gen
```

If you want to edit this information, run:

```
receipt-gen edit
```

## Reverting Receipt Numbers

If you need to revert receipt numbers, the settings file is located at:

```
$NODE_PATH/receipt_gen/settings.json
```

