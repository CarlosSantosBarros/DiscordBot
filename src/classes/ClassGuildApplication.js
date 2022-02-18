const StateGuildApplication = require("./state/StateGuildApplication");
const { ServerUtils, MemberUtils } = require("../utils/");
const MenuGuildApplication = require("./menus/menuGuildApplication");
const { GW2Player } = require("./GW2Player");
const { getWorld } = require("../utils/utilsGw2API");

exports.ClassGuildApplication = class {
  constructor(user) {
    this.server = new ServerUtils();
    this.member = this.getMember(user);
    this.state = new StateGuildApplication(user.id);
  }

  getMember(user) {
    const member = this.server.getMemberById(user.id);
    return new MemberUtils(member);
  }

  async startApplication(member) {
    const player = new GW2Player(member);
    await player.init();
    const accountData = player.getApplicationData();
    const serverInfo = await getWorld(accountData.application.server);
    this.state = await this.state.setAccountData(accountData, serverInfo);
  }

  async submit() {
    const menu = new MenuGuildApplication(this.member, this.state);
    const embeds = menu.getEmbeds();
    const appChan = this.server.getApplicationChan();
    const msg = await appChan.send({ embeds: embeds });

    const app = this.getAppState();
    this.selectApplication(msg.id);
    await this.update(app);
    this.removeAppState(this.userId);
  }

  async addReason(message) {
    this.getAppStatus();
    if (!this.state) return await message.delete();
    this.setApplicationReason(message.content);
  }

  // refactor - config value for default messages
  async processApplication(message, reason) {
    const app = await this.getAppStatus();
    let appId = message.id;
    if (app) {
      appId = app.appId;
      reason = app.applicationStatus.reason;
      await message.delete();
    }
    this.selectApplication(appId);
    this.removeAppStatus(this.userId);
    return reason;
  }

  async accept(message) {
    const reason = await this.processApplication(
      message,
      "default Accepted reason for database"
    );
    await this.updateStatus("Accepted", reason);
    this.state = await this.getApplication();
  }

  async deny(message) {
    const reason = await this.processApplication(
      message,
      "default Denied reason for database"
    );
    await this.updateStatus("Denied", reason);
    this.state = await this.getApplication();
  }

  async blackList(message) {
    const reason = await this.processApplication(
      message,
      "default Blacklisted reason for database"
    );
    await this.updateStatus("Blacklisted", reason);
    this.state = await this.getApplication();
  }

  async updateMessage(message) {
    const menu = new MenuGuildApplication(this.member, this.state);
    const embeds = menu.getEmbeds();
    const components = menu.getComponents();
    // If statement to filter what kinda of change needs to be done
    if (message.emoji) {
      const appMessage = await message.message.channel.messages.fetch(
        this.state.applicationId
      );
      await appMessage.edit({ embeds: embeds });
    } else if (message.isSelectMenu())
      await message.update({ components: components, embeds: embeds });
    else if (message.isApplicationCommand())
      await message.editReply({
        content: "Please select the approriate answers and click continue",
        components: components,
        embeds: embeds,
      });
  }

  async notify() {
    const server = new ServerUtils();
    const member = server.getMemberById(this.state.snowflake);
    let replyMessage;
    if (this.state.applicationStatus) {
      const status = this.state.applicationStatus;
      // refactor - move these a config file
      switch (status.status) {
        case "Accepted":
          replyMessage = "default **Accepted** message sent to applicant";
          break;
        case "Denied":
          replyMessage = "default **Denied** message sent to applicant";
          break;
        case "Blacklisted":
          replyMessage = "default **Blacklisted** message sent to applicant";
          break;

        default:
          break;
      }
    }
    // member.send({ content: this.state.applicationStatus.reason });
    member.send({ content: replyMessage });
  }
};
