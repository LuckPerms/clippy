const { MessageEmbed } = require('discord.js');
const createTrigger = require('../create-trigger');
const { getJoinsAllowed, setJoinsAllowed } = require('../../antiraid/manager');

async function runner(trigger, message) {
  const parts = message.content.split(' ');
  const joinsAllowed = getJoinsAllowed();

  if (!['true', 'false'].includes(parts[1]))
    return await message.channel.send(
      new MessageEmbed()
        .setColor('#13ad79')
        .setTitle('Error')
        .setDescription(`Usage: \`!allowjoins <true/false>\`.`)
    );

  let desired = parts[1] === 'true';
  if (desired === joinsAllowed)
    return await message.channel.send(
      new MessageEmbed()
        .setColor('#13ad79')
        .setTitle('Error')
        .setDescription(
          `Joins are already set to ${desired ? 'enabled' : 'disabled'}!`
        )
    );

  setJoinsAllowed(desired);
  return await message.channel.send(
    new MessageEmbed()
      .setColor('#13ad79')
      .setTitle('Anti-Raid')
      .setDescription(
        `Joins are now set to ${desired ? 'enabled' : 'disabled'}!`
      )
  );
}

const allowJoinTrigger = createTrigger('allowjoin', runner, []);

module.exports = allowJoinTrigger;
