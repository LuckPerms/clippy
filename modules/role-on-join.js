const data = require('../data.json');

module.exports = (client) => {
  client.on('guildMemberAdd', async (member) => {
    await member.addRole(data.member_role, 'Autorole');
  });
};
