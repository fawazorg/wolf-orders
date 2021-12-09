const { Command } = require("wolf.js");
const { api } = require("../bot");
const orders = require("../orders/order");
const COMMAND_TRIGER = `${api.config.keyword}_command_check`;

/**
 * @param {import("wolf.js").WOLFBot} api
 * @param {import("wolf.js").CommandContextObject} command
 */
Check = async (api, command) => {
  await orders.Check(command);
};

module.exports = new Command(COMMAND_TRIGER, {
  group: (command) => Check(api, command),
});
