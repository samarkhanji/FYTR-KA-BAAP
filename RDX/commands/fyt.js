const fs = require('fs-extra');
const path = require('path');

const activeTargets = new Map();

// Use ENGLISH FILE for FYT command
const englishPath = path.join(__dirname, 'CONVO/ENGLISH FILE.txt');

function getEnglishMessages() {
  try {
    const content = fs.readFileSync(englishPath, 'utf8');
    const messages = content.split('\n').filter(m => m.trim().length > 0);
    return messages;
  } catch {
    return ['Hello! How are you?'];
  }
}

function getRandomMessage() {
  const messages = getEnglishMessages();
  return messages[Math.floor(Math.random() * messages.length)];
}

async function startTagging(api, threadID, targetUID, config, cachedName) {
  const key = `${threadID}_${targetUID}`;

  if (activeTargets.has(key)) {
    return false;
  }

  let userName = cachedName || 'User';

  const interval = setInterval(async () => {
    try {
      const tag = `@${userName}`;
      const message = `${tag} ${getRandomMessage()}`;

      const mentions = [{
        tag: tag,
        id: targetUID,
        fromIndex: 0
      }];

      await api.sendMessage({
        body: message,
        mentions: mentions
      }, threadID);
    } catch (error) {
      console.error('FYT Error:', error.message);
    }
  }, 5000);

  activeTargets.set(key, interval);
  return true;
}

function stopTagging(threadID, targetUID) {
  const key = `${threadID}_${targetUID}`;

  if (!activeTargets.has(key)) {
    return false;
  }

  clearInterval(activeTargets.get(key));
  activeTargets.delete(key);
  return true;
}

module.exports = {
  config: {
    credits: "SARDAR RDX",
    name: 'fyt',
    aliases: ['fuckytag'],
    description: 'Tag someone with ENGLISH FILE messages',
    usage: 'fyt on @mention | fyt off @mention',
    category: 'Fun',
    adminOnly: true,
    groupOnly: true,
    prefix: true
  },

  async run({ api, event, args, send, config, Users }) {
    const { threadID, senderID, mentions } = event;

    // Only bot admins can use this command
    const isAdmin = config.ADMINBOT?.includes(senderID);
    if (!isAdmin) {
      return; // Bot ignores non-admins completely
    }

    if (args.length === 0) {
      return send.reply(`╔════════════════════════════╗
║       🔥 FYT COMMAND 🔥     
╠════════════════════════════╣
║ Usage:
║ • fyt on @mention - Start  
║ • fyt off @mention - Stop
║ 
║ ⏱️ Speed: 5 seconds
║ 📁 Source: ENGLISH FILE
╚════════════════════════════╝`);
    }

    const action = args[0].toLowerCase();

    if (action !== 'on' && action !== 'off') {
      return send.reply(`╔════════════════════════════╗
║   ❌ INVALID ACTION          
║
║ Use "on" or "off"
╚════════════════════════════╝`);
    }

    const mentionIDs = Object.keys(mentions || {});

    if (mentionIDs.length === 0) {
      return send.reply(`╔════════════════════════════╗
║   ❌ TAG SOMEONE!           
║
║ Example: fyt on @user
╚════════════════════════════╝`);
    }

    const targetUID = mentionIDs[0];
    let targetName = 'User';
    try {
      targetName = await Users.getValidName(targetUID, 'User');
    } catch {
      try {
        targetName = await Users.getNameUser(targetUID);
        if (targetName.toLowerCase() === 'facebook user' || targetName.toLowerCase() === 'facebook') {
          targetName = 'User';
        }
      } catch { }
    }

    if (action === 'on') {
      const started = startTagging(api, threadID, targetUID, config, targetName);

      if (!started) {
        return send.reply(`╔════════════════════════════╗
║   ⚠️ ALREADY TAGGING        
║
║ ${targetName} is being tagged!
║ Use "fyt off @${targetName}"
╚════════════════════════════╝`);
      }

      return send.reply(`╔════════════════════════════╗
║   🔥 FYT MODE ACTIVATED 🔥 
╠════════════════════════════╣
║ 🎯 Target: ${targetName}
║ ⏱️ Speed: 5 seconds
║ 📁 Source: ENGLISH FILE
║ ✅ Status: Running
╚════════════════════════════╝

Use "fyt off @${targetName}" to stop!`);

    } else if (action === 'off') {
      const stopped = stopTagging(threadID, targetUID);

      if (!stopped) {
        return send.reply(`╔════════════════════════════╗
║   ⚠️ NOT TAGGING            
║
║ ${targetName} is not being
║ tagged!
╚════════════════════════════╝`);
      }

      return send.reply(`╔════════════════════════════╗
║   ✅ FYT MODE STOPPED       
╠════════════════════════════╣
║ 🎯 Target: ${targetName}
║ ✅ Status: Deactivated
╚════════════════════════════╝`);
    }
  }
};
