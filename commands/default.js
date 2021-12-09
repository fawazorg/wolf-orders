const { Command } = require("wolf.js");
const { api } = require("../bot");

const COMMAND_TRIGER = `${api.config.keyword}_command_default`;
const COMMAND_RESPONSE = `${api.config.keyword}_default_message`;

Default = async (api, command) => {
  await api
    .messaging()
    .sendMessage(
      command,
      api.phrase().getByLanguageAndName(command.language, COMMAND_RESPONSE)
    );
};

module.exports = new Command(COMMAND_TRIGER, {
  group: (command) => Default(api, command),
});
