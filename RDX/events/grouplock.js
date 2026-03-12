const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        credits: "SARDAR RDX",
        name: "grouplock",
        eventType: ["log:thread-name", "log:thread-image", "log:thread-icon", "log:thread-color"],
        description: "Automatically restore group name/picture when locked"
    },

    async run({ api, event, Threads, send, logMessageType, logMessageData }) {
        const { threadID } = event;

        // Get thread settings
        const settings = Threads.getSettings(threadID);

        if (!settings) return;

        const botID = api.getCurrentUserID();

        // Handle group name changes
        if (logMessageType === "log:thread-name" && settings.lockName) {
            const newName = logMessageData.name;
            const lockedName = settings.customLockedName || settings.originalName;

            if (newName !== lockedName && lockedName) {
                try {
                    // Restore the locked name
                    await api.setTitle(lockedName, threadID);

                    send.reply(`╔════════════════════════════╗
║   ⚠️ NAME LOCKED!          
║
║ Name restored: ${lockedName}
╚════════════════════════════╝`);
                } catch (error) {
                    console.error('Failed to restore name:', error.message);
                }
            }
        }

        // Handle group picture changes
        if (logMessageType === "log:thread-image" && settings.lockImage) {
            const imagePath = settings.originalImagePath;

            if (imagePath && fs.existsSync(imagePath)) {
                try {
                    // Read the cached image and restore it
                    const imageBuffer = fs.readFileSync(imagePath);

                    // Upload and set the group image
                    const formData = {
                        file: imageBuffer
                    };

                    await api.changeGroupImage(formData, threadID);

                    send.reply(`╔════════════════════════════╗
║   ⚠️ IMAGE LOCKED!         
║
║ Image has been restored
╚════════════════════════════╝`);
                } catch (error) {
                    console.error('Failed to restore image:', error.message);
                }
            }
        }

        // Handle emoji changes
        if (logMessageType === "log:thread-icon" && settings.lockEmoji) {
            const lockedEmoji = settings.originalEmoji;

            if (lockedEmoji) {
                try {
                    await api.changeThreadEmoji(lockedEmoji, threadID);

                    send.reply(`╔════════════════════════════╗
║   ⚠️ EMOJI LOCKED!         
║
║ Emoji has been restored
╚════════════════════════════╝`);
                } catch (error) {
                    console.error('Failed to restore emoji:', error.message);
                }
            }
        }

        // Handle theme/color changes
        if (logMessageType === "log:thread-color" && settings.lockTheme) {
            const lockedTheme = settings.originalTheme;

            if (lockedTheme) {
                try {
                    await api.changeThreadColor(lockedTheme, threadID);

                    send.reply(`╔════════════════════════════╗
║   ⚠️ THEME LOCKED!         
║
║ Theme has been restored
╚════════════════════════════╝`);
                } catch (error) {
                    console.error('Failed to restore theme:', error.message);
                }
            }
        }
    }
};
