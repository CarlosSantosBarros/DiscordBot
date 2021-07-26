const { getDBUserById } = require("../utils/utilsDatabase");
const { emojiReply } = require("../utils/utilsEmoji");
const { getGW2TokenInfo } = require("../utils/utilsGw2API");

module.exports = {
  name: "testkey",
  description: "Test API key",
  args: [],
  usage: "<APIKEY>",

  async execute(message) {
    const user = await getDBUserById(message.author.id);
    const response = await getGW2TokenInfo(user.apikey);
    if (response.text) throw response.text;
    // config object should be "emoji, function/action, collector config"
    const emoji = "👍";
    const funct = () => {
      message.reply("Api key name: '" + response.name + "' tested");
    };
    // params should be (message, config object)
    await emojiReply(message, emoji, funct);
    // await message.reply("Api key name: '" + response.name + "' tested");
  },
};
