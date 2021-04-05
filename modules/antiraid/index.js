const fs = require('fs/promises');
const {
  syncToDisk,
  getJoinsList,
  setJoinsList,
  getJoinsAllowed,
  getCachePath,
} = require('./manager');

console.log('ready');

module.exports = client => {
  client.once('ready', async () => {
    // Ensure there is a valid joins cache
    const cachePath = getCachePath();
    try {
      setJoinsList(JSON.parse(await fs.readFile(cachePath, 'utf-8')));
    } catch (e) {
      console.log('Did not find join cache file / was invalid, creating it.');
      await fs.writeFile(cachePath, '[]');
    }

    // Start flushing to disk every minute, and garbage collecting old joins
    setInterval(syncToDisk, 1000 * 10);
  });

  client.on('guildMemberAdd', async member => {
    if (!getJoinsAllowed())
      return await member.kick({
        reason: 'Anti-Raid: please try re-joining later',
      });

    const { id, joinedTimestamp } = member;
    const serializableMember = { id, joinedTimestamp };
    // If they have a previous entry in the list, remove it.
    const newJoinsList = getJoinsList().filter(m => m.id !== id);
    newJoinsList.push(serializableMember);
    setJoinsList(newJoinsList);
  });
};
