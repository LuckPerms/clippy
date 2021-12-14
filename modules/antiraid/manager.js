const fs = require('fs/promises');
const CACHE_PATH = './data/joincache.json';

let joinsList = [];
let joinsAllowed = true;

antiraidManager = {
  // For speed & concurrency (as multiple guildMemberAdds can run at once), just sync the list to disk every minute
  syncToDisk: async () => {
    // Purge members older than 6 hours from the possible joins list
    joinsList = joinsList.filter(
      member => member.joinedTimestamp > Date.now() - 1000 * 60 * 60 * 6
    );
    await fs.writeFile(CACHE_PATH, JSON.stringify(joinsList));
  },

  getJoinsList: () => joinsList,

  setJoinsList: newList => {
    joinsList = newList;
  },

  getJoinsAllowed: () => joinsAllowed,

  setJoinsAllowed: desired => {
    joinsAllowed = desired;
  },

  getCachePath: () => CACHE_PATH,
};

module.exports = antiraidManager;
