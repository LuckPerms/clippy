const { MessageEmbed } = require('discord.js');
const createTrigger = require('../create-trigger');
const { getJoinsList, setJoinsList } = require('../../antiraid/manager');

async function runner(trigger, message) {
  const parts = message.content.split(' ');
  const joinsList = getJoinsList();

  // Check they have submitted the time as a number followed by an M
  if (
    parts.length < 2 ||
    parts[1].split('m').length !== 2 ||
    parts[1].split('m')[1] !== '' ||
    !parseInt(parts[1].split('m')[0])
  ) {
    return await message.channel.send(
      new MessageEmbed()
        .setColor('#13ad79')
        .setTitle('Error Checking')
        .setDescription(
          `Please add a timestamp to perform this action. For example \`!bansince 30m\` would purge all users who joined in the last 30 minutes. Max of 6 hours, only accepts minutes as a timescale.`
        )
    );
  }

  const minutes = parseInt(parts[1].split('m')[0]);
  const startTimestamp = Date.now() - 1000 * 60 * minutes;
  const membersToBan = joinsList.filter(
    member => member.joinedTimestamp > startTimestamp
  );

  if (trigger === 'checksince')
    return await message.channel.send(
      new MessageEmbed()
        .setColor('#13ad79')
        .setTitle('Preview Anti-Raid Kick/Ban')
        .setDescription(
          `\`${membersToBan.length}\` members would be affected by this command. To confirm, run \`!bansince ${minutes}m\` or \`!kicksince ${minutes}m\`.`
        )
    );
  const action = { bansince: 'ban', kicksince: 'kick' }[trigger];

  let progressMessage = await message.channel.send(
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
      const guildMember = await message.guild.members.fetch(member.id);

      if (action === 'ban')
        await guildMember.ban({ days: 1, reason: 'Anti-Raid' });
      else if (action === 'kick')
        await guildMember.kick({ reason: 'Anti-Raid' });

      // Remove the banned member from the joinlist so future ban commands don't try to re-ban them
      setJoinsList(joinsList.filter(m => m.id !== member.id));
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
}

const banSinceTrigger = createTrigger(
  'bansince',
  runner,
  ['kicksince', 'checksince'],
  ['BAN_MEMBERS'],
  []
);

module.exports = banSinceTrigger;
