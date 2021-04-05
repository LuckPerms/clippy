const discord = require('discord.js');

module.exports = client => {
  client.on('message', async msg => {
    // Ignore ourself
    if (msg.author.bot) return;
    // Ignore DMs
    if (msg.channel.type !== 'text') return;

    // If the stripped message contains luckyperms
    if (
      msg.content.toLowerCase().replace(/\W/gm, '').indexOf('luckyperms') !== -1
    ) {
      await msg.channel.send(
        new discord.MessageEmbed()
          .setTitle("It looks like you're trying to spell LuckPerms!")
          .setDescription(
            'A useful tip to remember how to spell it is: LUCK is not LUCKY'
          )
          .setThumbnail(
            'http://lssinfotech.files.wordpress.com/2011/05/clippy.jpg'
          )
      );
    }
  });
};
