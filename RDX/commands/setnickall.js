module.exports = {
    config: {
        credits: "SARDAR RDX",
        name: 'setnickall',
        aliases: ['setnickall', 'nickall', 'allnick', 'setnicksall'],
        description: "Set nickname for ALL group members (admin only).",
        usage: 'setnickall [nickname]',
        category: 'Group',
        groupOnly: true,
        prefix: true,
        adminOnly: true
    },

    async run({ api, event, args, send, config }) {
        const { threadID, senderID } = event;

        const threadInfo = await api.getThreadInfo(threadID);

        const isGroupAdmin = threadInfo.adminIDs.some(a => a.id === senderID);
        const isBotAdmin = config.ADMINBOT?.includes(senderID);

        // Only bot admins can use this command
        if (!isBotAdmin) {
            return; // Silently ignore
        }

        const nickname = args.join(' ');

        if (!nickname) {
            return send.reply(`╔════════════════════════════╗
║    📝 SETNICKALL COMMAND    
╠════════════════════════════╣
║ Usage: .setnickall [nickname]
║ 
║ Example: .setnickall 👑 King
╚════════════════════════════╝`);
        }

        const participants = threadInfo.participantIDs;
        const botID = api.getCurrentUserID();

        // Filter out bot's own ID
        const membersToUpdate = participants.filter(id => id !== botID);

        let successCount = 0;
        let failCount = 0;

        // Send initial message
        await send.reply(`🔄 Setting nickname for ${membersToUpdate.length} members...\nNickname: ${nickname}`);

        for (const uid of membersToUpdate) {
            try {
                await api.changeNickname(nickname, threadID, uid);
                successCount++;

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                failCount++;
            }
        }

        return send.reply(`╔════════════════════════════╗
║   ✅ NICKNAME SET COMPLETE   
╠════════════════════════════╣
║ 👥 Total Members: ${membersToUpdate.length}
║ ✅ Success: ${successCount}
║ ❌ Failed: ${failCount}
╠════════════════════════════╣
║ 📝 Nickname: ${nickname}
╚════════════════════════════╝`);
    }
};
