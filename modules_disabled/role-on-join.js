module.exports = (client) => {
  client.on('guildMemberAdd', async (member) => {
    await member.roles.add(process.env.DISCORD_MEMBER_ROLE, 'Autorole');
  });
};
