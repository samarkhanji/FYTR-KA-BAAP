module.exports = {
    config: {
        credits: "SARDAR RDX",
        name: 'clearnicknames',
        aliases: ['clearnick', 'removenicks', 'clearnickall', 'remallnick'],
        description: "Clear ALL group members' nicknames (admin only).",
        usage: 'clearnicknames',
        category: 'Group',
        groupOnly: true,
        prefix: true,
        adminOnly: true
    },

    async run({ api, event, args, send, config }) {
        const { threadID, senderID } = event;

        const threadInfo = await api.getThreadInfo(threadID);

        const isBotAdmin = config.ADMINBOT?.includes(senderID);

        // Only bot admins can use this command
        if (!isBotAdmin) {
            return; // Silently ignore
        }

        const participants = threadInfo.participantIDs;
        const botID = api.getCurrentUserID();

        // Filter out bot's own ID
        const membersToUpdate = participants.filter(id => id !== botID);

        let successCount = 0;
        let failCount = 0;

        // Send initial message
        await send.reply(`🔄 Clearing nicknames for ${membersToUpdate.length} members...`);

        for (const uid of membersToUpdate) {
            try {
                await api.changeNickname('', threadID, uid);
                successCount++;

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                failCount++;
            }
        }

        return send.reply(`╔════════════════════════════╗
║   ✅ NICKNAMES CLEARED!     
╠════════════════════════════╣
║ 👥 Total Members: ${membersToUpdate.length}
║ ✅ Success: ${successCount}
║ ❌ Failed: ${failCount}
╠════════════════════════════╣
║ 📝 All nicknames removed
╚════════════════════════════╝`);
    }
};
