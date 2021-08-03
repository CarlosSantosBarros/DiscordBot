const { getCollection } = require("../modules/moduleEmojiTest");

module.exports = {
  name: "single",
  description: "Test emoji functionality",
  args: [],
  usage: "<comand>",

  async execute(message) {
    const optionsCollection = getCollection();
    const emojiOptionConfig = {
      collection: optionsCollection,
      commandUser: message.author.id,
      collectorSettings: {
        max: 1,
        time: 10000,
        errors: ["time"],
      },
    };
    const emojiDialog = await require("../modules/moduleEmojiCommandInterface")(
      message,
      emojiOptionConfig
    );
    await emojiDialog.createDialogMessage("Select 1");
    await emojiDialog.emojiSelectMuiltiActionFromOptions();
  },
};
