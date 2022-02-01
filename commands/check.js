const { Command, Constants } = require("wolf.js");
const { api } = require("../bot");
const orders = require("../orders/order");
const COMMAND_TRIGER = `${api.config.keyword}_command_check`;

/**
 * @param {import("wolf.js").WOLFBot} api
 * @param {import("wolf.js").CommandContextObject} command
 */
Check = async (api, command) => {
  let okay = await api
    .utility()
    .group()
    .member()
    .hasCapability(
      command.targetGroupId,
      command.sourceSubscriberId,
      Constants.Capability.MOD,
      true
    );
  if (okay) {
    return await orders.Check(command);
  }
  return await api
    .messaging()
    .sendMessage(command, api.phrase().getByLanguageAndName(command.language, ADMIN_ONLY));
};

module.exports = new Command(COMMAND_TRIGER, {
  group: (command) => Check(api, command),
});
