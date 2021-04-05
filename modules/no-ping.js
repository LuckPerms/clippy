const STAFF_ROLES = process.env.DISCORD_STAFF_ROLES.split(',');

module.exports = client => {
  client.on('message', async msg => {
    // Ignore DMs, messages that don't mention anyone, and messages that are a reply.
    if (msg.channel.type !== 'text') return;
    if (msg.mentions.members.size === 0) return;
    if (msg.reference !== null) return;

    const senderIsStaff = msg.member.roles.cache.some(
      role => STAFF_ROLES.indexOf(role.name) !== -1
    );
    if (senderIsStaff) {
      return;
    }

    const mentionsStaff = msg.mentions.members.some(member => {
      // If the message mentions any members that satisfy the following:
      return member.roles.cache.some(
        role => STAFF_ROLES.indexOf(role.name) !== -1
      );
    });

    if (mentionsStaff) {
      // Tell them off:
      await msg.channel.send(
        `Hey ${
          msg.member.nickname ?? msg.author.username
        }! Please don't tag helpful/staff members directly.`
      );
    }
  });
};
