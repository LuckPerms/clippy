const fs = require('fs/promises');
const { MessageEmbed } = require('discord.js');
const CACHE_PATH = './joincache.json';

let joinsList = [];
let joinsAllowed = true;

// For speed & concurrency (as multiple guildMemberAdds can run at once), just sync the list to disk every minute
async function syncToDisk() {
  // Purge members older than 6 hours from the possible joins list
  joinsList = joinsList.filter(
    member => member.joinedTimestamp > Date.now() - 1000 * 60 * 60 * 6
  );
  await fs.writeFile(CACHE_PATH, JSON.stringify(joinsList));
}

module.exports = client => {
  client.once('ready', async () => {
    // Ensure there is a valid joins cache
    try {
      joinsList = JSON.parse(await fs.readFile(CACHE_PATH, 'utf-8'));
    } catch (e) {
      console.log('Did not find join cache file / was invalid, creating it.');
      await fs.writeFile(CACHE_PATH, '[]');
    }

    // Start flushing to disk every minute, and garbage collecting old joins
    setInterval(syncToDisk, 1000 * 10);
  });

  client.on('guildMemberAdd', async member => {
    if (!joinsAllowed)
      return await member.kick({
        reason: 'Anti-Raid: please try re-joining later',
      });

    const { id, joinedTimestamp } = member;
    const serializableMember = { id, joinedTimestamp };
    // If they have a previous entry in the list, remove it.
    joinsList = joinsList.filter(m => m.id !== id);
    joinsList.push(serializableMember);
  });

  client.on('message', async msg => {
    // Check permission - no real need for an error message as nobody will know about the command
    if (
      !msg.guild ||
      msg.author.bot ||
      !msg.member.hasPermission('BAN_MEMBERS')
    )
      return;

    let parts = msg.content.split(' ');
    let command = parts[0].substring(1);
    if (['bansince', 'kicksince', 'checksince'].includes(command)) {
      // Check they have submitted the time as a number followed by an M
      if (
        parts[1].split('m').length !== 2 ||
        parts[1].split('m')[1] !== '' ||
        !parseInt(parts[1].split('m')[0])
      ) {
        return await msg.channel.send(
          new MessageEmbed()
            .setColor('#13ad79')
            .setTitle('Error Checking')
            .setDescription(
              `Please add a timestamp to perform this action. For example \`!bansince purge 30m\` would purge all users who joined in the last 30 minutes. Max of 6 hours, only accepts minutes as a timescale.`
            )
        );
      }

      let minutes = parseInt(parts[1].split('m')[0]);
      let startTimestamp = Date.now() - 1000 * 60 * minutes;
      let membersToBan = joinsList.filter(
        member => member.joinedTimestamp > startTimestamp
      );

      if (command === 'checksince')
        return await msg.channel.send(
          new MessageEmbed()
            .setColor('#13ad79')
            .setTitle('Preview Anti-Raid Kick/Ban')
            .setDescription(
              `\`${membersToBan.length}\` members would be affected by this command. To confirm, run \`!bansince ${minutes}m\` or \`!kicksince ${minutes}m\`.`
            )
        );
      let action = { bansince: 'ban', kicksince: 'kick' }[command];

      let progressMessage = await msg.channel.send(
        new MessageEmbed()
          .setColor('#13ad79')
          .setTitle(`Purging members (${action})...`)
          .setDescription(
            `Preparing to ${action} \`${membersToBan.length}\` members.`
          )
      );

      let lastProgressUpdate = Date.now();
      let failCount = 0;
      let banCount = 0;

      for (const member of membersToBan) {
        try {
          const guildMember = await msg.guild.members.fetch(member.id);

          if (action === 'ban')
            await guildMember.ban({ days: 1, reason: 'Anti-Raid' });
          else if (action === 'kick')
            await guildMember.kick({ reason: 'Anti-Raid' });

          // Remove the banned member from the joinlist so future ban commands don't try to re-ban them
          joinsList = joinsList.filter(m => m.id !== member.id);
          banCount++;

          // Update the progress embed every 5 seconds
          if (Date.now() - lastProgressUpdate > 1000 * 5) {
            await progressMessage.edit(
              new MessageEmbed()
                .setColor('#13ad79')
                .setTitle('Purging members...')
                .setDescription(
                  `Action: ${action}.\nProgress: \`${banCount}/${
                    membersToBan.length
                  }\` members${
                    failCount ? ` (\`${failCount} failed to ${action}\`)` : ''
                  }.`
                )
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
          .setTitle('Finished purging!')
          .setDescription(
            `Action: ${action}\nCount: \`${banCount}/${
              membersToBan.length
            }\` members${failCount ? ` (\`${failCount} failed to ban\`)` : ''}.`
          )
      );
    } else if (command === 'allowjoins') {
      if (!['true', 'false'].includes(parts[1]))
        return await msg.channel.send(
          new MessageEmbed()
            .setColor('#13ad79')
            .setTitle('Error')
            .setDescription(`Usage: \`!allowjoins <true/false>\`.`)
        );

      let desired = parts[1] === 'true';
      if (desired === joinsAllowed)
        return await msg.channel.send(
          new MessageEmbed()
            .setColor('#13ad79')
            .setTitle('Error')
            .setDescription(
              `Joins are already set to ${desired ? 'enabled' : 'disabled'}!`
            )
        );

      joinsAllowed = desired;
      return await msg.channel.send(
        new MessageEmbed()
          .setColor('#13ad79')
          .setTitle('Anti-Raid')
          .setDescription(
            `Joins are now set to ${desired ? 'enabled' : 'disabled'}!`
          )
      );
    }
  });
};
