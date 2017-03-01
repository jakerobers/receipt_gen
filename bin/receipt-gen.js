#!/usr/bin/env node

var should_edit = false;
if (process.argv[1] && process.argv[1] === "edit") {
  should_edit = true;
}

if (process.argv[2] && process.argv[2] === "edit") {
  should_edit = true;
}

require("../lib/main").run(should_edit);

