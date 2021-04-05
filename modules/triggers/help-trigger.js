const { MessageEmbed } = require('discord.js');
const createTrigger = require('./create-trigger');

const createHelpTrigger = (triggers) => {
  const list = triggers.reduce((array, current) => [ ...array, ...current.helpList], []).sort();
  const listHalf = Math.ceil(list.length / 2);

  const listReducer = (prev, command) => `${prev}\`!${command}\`\n`;

  const leftList = list.splice(0, listHalf).reduce(listReducer, '');
  const rightList = list.splice(-listHalf).reduce(listReducer, '');

  const helpResponse = new MessageEmbed({
    title: 'Available commands',
    color: '#94df03',
    fields: [
      {
        name: '\u200E',
        value: leftList,
        inline: true,
      },
      {
        name: '\u200E',
        value: rightList,
        inline: true,
      },
    ]
  });

  async function action(trigger, message) {
    try {
      await message.channel.send({ embed: helpResponse });
    } catch (error) {
      console.error(error);
    }
  }

  return createTrigger('help',action,['halp']);
}

module.exports = createHelpTrigger;
