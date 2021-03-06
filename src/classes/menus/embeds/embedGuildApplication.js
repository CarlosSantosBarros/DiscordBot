const { MessageEmbed } = require("discord.js");
const FieldProficiency = require("./embedComponents/fieldProficiency");
const { client } = require("../../../index");
const { memberNicknameMention } = require("@discordjs/builders");
const FieldAppStatus = require("./embedComponents/fieldAppStatus");

module.exports = class EmbedGuildApplication extends MessageEmbed {
  constructor(member, state) {
    super();
    this.user = member.getUser();
    this.setAuthor({ name: this.user.username });
    this.setTitle("Guild Application");
    this.setDescription(
      `${memberNicknameMention(this.user.id)}/${state.accountName}`
    );
    this.setThumbnail(this.user.avatarURL());
    let embedColour = "YELLOW";
    const application = state.application;
    this.addField("Server:", `${application.server.name}`);
    this.addField("WvW Rank:", `${application.wvwRank}`);
    if (application.isLegal)
      this.addField("Are you over 18?", application.isLegal);
    if (application.willRoleSwap)
      this.addField(
        "Are you willing to play other classes or builds?",
        application.willRoleSwap
      );
    if (application.hasDoneProfs)
      // @ts-ignore
      client.proficiencyData.forEach((proficiency) =>
        // @ts-ignore
        this.addFields(new FieldProficiency(proficiency, member))
      );
    if (application.personalMessage)
      this.addField("Personal Message", application.personalMessage);
    if (state.applicationStatus) {
      const status = state.applicationStatus;
      switch (status.status) {
        case "Denied":
          embedColour = "RED";
          break;
        case "Blacklisted":
          embedColour = "NOT_QUITE_BLACK";
          break;
        default:
          embedColour = "GREEN";
          break;
      }
      // @ts-ignore
      this.addFields(new FieldAppStatus(state.applicationStatus));
    }
    // @ts-ignore
    this.setColor(embedColour);
  }
};
