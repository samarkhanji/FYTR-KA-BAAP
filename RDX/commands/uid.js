module.exports = {
  config: {
    credits: "SARDAR RDX",
    name: 'uid',
    aliases: ['id', 'userid'],
    description: "Get yours or a mentioned user's Facebook ID.",
    usage: 'uid [@user]',
    category: 'Utility',
    prefix: true
  },

  async run({ api, event, args, send, Users }) {
    let { senderID, mentions } = event;

    // Fallback: Get bot's own ID if senderID is not available
    if (!senderID || senderID === 'undefined' || senderID === 'null') {
      try {
        senderID = await api.getCurrentUserID();
      } catch (e) {
        senderID = null;
      }
    }

    if (event.mentions && Object.keys(event.mentions).length > 0) {
      // Filter out empty mentions and get the last one
      const mentionIDs = Object.keys(event.mentions).filter(id => id && id !== "null" && id !== "undefined");
      if (mentionIDs.length > 0) {
        senderID = mentionIDs[mentionIDs.length - 1];
      }
    } else if (event.messageReply && event.messageReply.senderID) {
      senderID = event.messageReply.senderID;
    }

    if (!senderID) {
      return send.reply("Unable to get user ID. Please try again.");
    }

    const name = await Users.getNameUser(senderID);

    return send.reply(`User: ${name}
UID: ${senderID}`);
  }
};
