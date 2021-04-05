const { MessageEmbed } = require('discord.js');
const createTrigger = require('../create-trigger');
const metaData = require('../../../meta-data');

async function runner(trigger, message) {
  const embed = new MessageEmbed({
    title: 'Latest version',
    color: '#94df03',
    description: metaData().version,
  });

  try {
    await message.channel.send({ embed });
  } catch (error) {
    console.error(error);
  }
}

const versionTrigger = createTrigger('version', runner, ['latest']);

module.exports = versionTrigger;
