const data = require('../data.json');

module.exports = (client) => {
  client.on('guildMemberAdd', async (member) => {
    await member.roles.add(data.member_role, 'Autorole');
  });
};
