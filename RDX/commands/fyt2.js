const fs = require('fs-extra');
const path = require('path');

const activeFYT2 = new Map();

function getMathsMessages() {
  const mathsPath = path.join(__dirname, 'CONVO/MATHS FILE.txt');
  try {
    const content = fs.readFileSync(mathsPath, 'utf8');
    const messages = content.split('\n').filter(m => m.trim().length > 0);
    return messages;
  } catch {
    return ['MATH IS FUN!'];
  }
}

function getRandomMathsMessage() {
  const messages = getMathsMessages();
  return messages[Math.floor(Math.random() * messages.length)];
}

async function startFYT2(api, threadID, targetName, config) {
  const key = threadID;

  if (activeFYT2.has(key)) {
    return false;
  }

  // 5 seconds delay (5000ms)
  const r = 5000;
  let messageIndex = 0;
  const messages = getMathsMessages();

  const interval = setInterval(async () => {
    try {
      const msg = getRandomMathsMessage();
      const message = `${targetName} ${msg}`;

      await api.sendMessage(message, threadID);
      messageIndex++;

      // Loop messages endlessly - restart from beginning when finished
      if (messageIndex >= messages.length) {
        messageIndex = 0;
      }
    } catch (error) {
      console.error('FYT2 Error:', error.message);
      clearInterval(interval);
      activeFYT2.delete(key);
    }
  }, r);

  activeFYT2.set(key, interval);
  return true;
}

function stopFYT2(threadID) {
  const key = threadID;

  if (!activeFYT2.has(key)) {
    return false;
  }

  clearInterval(activeFYT2.get(key));
  activeFYT2.delete(key);
  return true;
}

module.exports.config = {
  name: "fyt2",
  version: "2.0.0",
  hasPermssion: 2,
  credits: "SARDAR RDX",
  description: "Tag with MATHS FILE messages (admin only, 5s delay)",
  commandCategory: "group",
  usages: "fyt2 on @user | fyt2 off",
  cooldowns: 10,
  adminOnly: true,
  dependencies: {
    "fs-extra": ""
  }
};

module.exports.run = async function ({ api, args, Users, event, config }) {
  const { threadID, senderID, mentions } = event;

  if (args.length === 0) {
    return api.sendMessage(`╔════════════════════════════╗
║      🔥 FYT2 COMMAND 🔥      
╠════════════════════════════╣
║ Usage:
║ • fyt2 on @user - Start     
║ • fyt2 off - Stop           
║ 
║ ⏱️ Speed: 5 seconds         
║ 📁 Source: MATHS FILE        
╚════════════════════════════╝`, threadID);
  }

  const action = args[0].toLowerCase();

  if (action === 'on') {
    // Check admin permission
    const isAdmin = config.ADMINBOT?.includes(senderID);

    if (!isAdmin) {
      return; // Silently ignore
    }

    const mentionIDs = Object.keys(mentions || {});

    if (mentionIDs.length === 0) {
      return api.sendMessage(`╔════════════════════════════╗
║   ❌ TAG SOMEONE!           
║
║ Example: fyt2 on @user
╚════════════════════════════╝`, threadID);
    }

    const targetUID = mentionIDs[0];
    let targetName = 'User';
    try {
      const userInfo = await api.getUserInfo(targetUID);
      targetName = userInfo[targetUID]?.name || 'User';
    } catch { }

    const started = await startFYT2(api, threadID, targetName, config);

    if (!started) {
      return api.sendMessage(`╔════════════════════════════╗
║   ⚠️ ALREADY RUNNING        
║
║ Use "fyt2 off" to stop
╚════════════════════════════╝`, threadID);
    }

    return api.sendMessage(`╔════════════════════════════╗
║   🔥 FYT2 MODE ACTIVATED 🔥
╠════════════════════════════╣
║ 🎯 Target: ${targetName}
║ ⏱️ Speed: 5 seconds
║ 📁 Source: MATHS FILE
║ ✅ Status: Running
╚════════════════════════════╝

Use "fyt2 off" to stop!`, threadID);

  } else if (action === 'off') {
    const stopped = stopFYT2(threadID);

    if (!stopped) {
      return api.sendMessage(`╔════════════════════════════╗
║   ⚠️ NOT RUNNING           
║
║ FYT2 is not active
╚════════════════════════════╝`, threadID);
    }

    return api.sendMessage(`╔════════════════════════════╗
║   ✅ FYT2 MODE STOPPED     
╠════════════════════════════╣
║ ✅ Status: Deactivated
╚════════════════════════════╝`, threadID);
  } else {
    return api.sendMessage(`╔════════════════════════════╗
║   ❌ INVALID ACTION         
║
║ Use "on" or "off"
╚════════════════════════════╝`, threadID);
  }
};
