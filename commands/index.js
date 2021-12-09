const Default = require("./default");
const Check = require("./check");
const Join = require("./join");
const Count = require("./count");
const Help = require("./help");
const Commands = [Check, Join, Count, Help];

Default.children = Commands;

module.exports = Default;
