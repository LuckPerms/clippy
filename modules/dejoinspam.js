const axios = require('axios');
const config = require('../config.json');
const data = require('../data.json');
const fs = require("fs/promises");
const { Message, MessageEmbed } = require("discord.js");
const CACHE_PATH = '/tmp/luckperms-joincache.json';

let joinsList = [];

// For speed & concurrency (as multiple guildMemberAdds can run at once), just sync the list to disk every minute
async function syncToDisk() {
  // Purge members older than 6 hours from the possible joins list
  joinsList = joinsList.filter(member => member.joinedTimestamp > (Date.now() - (1000 * 60 * 60 * 6)));
  await fs.writeFile(CACHE_PATH, JSON.stringify(joinsList));
}

module.exports = (client) => {
  client.once('ready', async () => {
    // Ensure there is a valid joins cache
    try {
      joinsList = JSON.parse(await fs.readFile(CACHE_PATH, 'utf-8'));
    } catch (e) {
      console.log("Did not find join cache file / was invalid, creating it.");
      await fs.writeFile(CACHE_PATH, '[]');
    }

    // Start flushing to disk every minute, and garbage collecting old joins
    setInterval(syncToDisk, 1000 * 10);
  });

  client.on('guildMemberAdd', async (member) => {
    const { id, joinedTimestamp } = member;
    const serializableMember = { id, joinedTimestamp };
    // If they have a previous entry in the list, remove it.
    joinsList = joinsList.filter(m => m.id !== id);
    joinsList.push(serializableMember);
  });

  client.on('message', async (msg) => {
    // Check permission - no real need for an error message as nobody will know about the command
    if (!msg.guild || !msg.member.hasPermission('BAN_MEMBERS') || msg.author.bot) return;

    let parts = msg.content.split(" ");
    if (parts[0] === '!dejoinspam' && parts[1] === "purge" && parts[2]) {
      // Start purging users

      // Check they have submitted the time as a number followed by an M
      if (parts[2].split("m").length !== 2 || parts[2].split("m")[1] !== "" || !parseInt(parts[2].split("m")[0])) {
        return await msg.channel.send(
          new MessageEmbed()
            .setColor('#13ad79')
            .setTitle('Error Purging')
            .setDescription(`Please add a timestamp to purge back to. For example \`!dejoinspam purge 30m\` would purge all users who joined in the last 30 minutes. Max of 6 hours, only accepts minutes as a timescale.`)
        );
      }

      let minutes = parseInt(parts[2].split("m")[0]);
      let startTimestamp = Date.now() - (1000 * 60 * minutes);
      let membersToBan = joinsList.filter(member => member.joinedTimestamp > startTimestamp);
      
      let progressMessage = await msg.channel.send(
        new MessageEmbed()
            .setColor('#13ad79')
            .setTitle('Banning members...')
            .setDescription(`Preparing to ban \`${membersToBan.length}\` members.`)
      );

      let lastProgressUpdate = Date.now();
      let failCount = 0;
      let banCount = 0;

      for (const member of membersToBan) {
        try {
          const guildMember = await msg.guild.members.fetch(member.id);
          await guildMember.ban({ days: 1, reason: `Anti-Raid by ${msg.author.tag}` });
          // Remove the banned member from the joinlist so future ban commands don't try to re-ban them
          joinsList = joinsList.filter(m => m.id !== member.id);

          banCount++;

          // Update the progress embed every 5 seconds
          if ((Date.now() - lastProgressUpdate) > (1000 * 5)) {
            await progressMessage.edit(
              new MessageEmbed()
                .setColor('#13ad79')
                .setTitle('Banning members...')
                .setDescription(`Banned \`${banCount}/${membersToBan.length}\` members${failCount ? ` (\`${failCount} failed to ban\`)` : ''}.`)
            );
            lastProgressUpdate = Date.now();
          }
        } catch (e) {
          // Don't remove failed ones from the list, so we can try again at some other point
          failCount += 1;
        }
      }

      await progressMessage.edit(
        new MessageEmbed()
          .setColor('#13ad79')
          .setTitle('Finished banning!')
          .setDescription(`Banned \`${banCount}/${membersToBan.length}\` members${failCount ? ` (\`${failCount} failed to ban\`)` : ''}.`)
      );
    } else if (parts[0] === '!dejoinspam' && parts[1]) {
      // Preview a purge
      if (parts[1].split("m").length !== 2 || parts[1].split("m")[1] !== "" || !parseInt(parts[1].split("m")[0])) {
        return await msg.channel.send(
          new MessageEmbed()
            .setColor('#13ad79')
            .setTitle('Error Purging')
            .setDescription(`Please add a timestamp to check back to. For example \`!dejoinspam 30m\` would check how many users were banned in the last 30 minutes.`)
        );
      }

      let minutes = parseInt(parts[1].split("m")[0]);
      let startTimestamp = Date.now() - (1000 * 60 * minutes);
      let membersToBan = joinsList.filter(member => member.joinedTimestamp > startTimestamp);

      return await msg.channel.send(
        new MessageEmbed()
          .setColor('#13ad79')
          .setTitle('Dejoinspam Preview')
          .setDescription(`\`${membersToBan.length}\` members would be banned by this command. To confirm, run \`!dejoinspam purge ${minutes}m\`.`)
      );
    } else if (parts[0] === '!dejoinspam') {
      // Invalid command, check usage
      await msg.channel.send(
        new MessageEmbed()
          .setColor('#13ad79')
          .setTitle('Dejoinspam Command')
          .setDescription(`Usage:\n\`!dejoinspam 30m\` - Previews how many users would be banned from this\n\`!dejoinspam purge 30m\` - Starts banning users`)
      );
    }
  })
};
