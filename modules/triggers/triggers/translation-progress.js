const { MessageEmbed } = require('discord.js');
const createTrigger = require('../create-trigger');
const metaData = require('../../../meta-data');

let embed;

const setEmbed = () => {
  const { translations } = metaData();

  if (!translations) return;

  const list = Object.values(translations.languages).sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
  const listHalf = Math.ceil(list.length / 2);

  const formatFlag = localeTag => {
    switch (localeTag) {
      case 'en_PT':
        return ':pirate_flag:';
      case 'sr_CS':
        return ':flag_rs:';
      default:
        const countryCode = localeTag.split('_')[1].toLowerCase();
        return `:flag_${countryCode}:`;
    }
  };

  const listReducer = (prev, language) => {
    const { name, localeTag, progress } = language;
    const emoji = formatFlag(localeTag);
    return `${prev}${emoji} **${name}** - \`${progress}%\`\n`;
  };

  const leftList = list.splice(0, listHalf).reduce(listReducer, '');
  const rightList = list.splice(-listHalf).reduce(listReducer, '');

  embed = new MessageEmbed({
    title: 'Translation progress',
    color: '#94df03',
    description: `If you can help translate LuckPerms, please visit our Crowdin project!\nhttps://crowdin.com/project/luckperms`,
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
    ],
  });
};

// Offset the first setEmbed by a few seconds to give metaData a chance to populate...
setTimeout(() => {
  setEmbed();

  // ... then update the embed every minute
  setInterval(() => {
    setEmbed();
  }, /* 1 minute */ 60 * 1000);
}, /* 5 seconds */ 5 * 1000);

async function runner(trigger, message) {
  try {
    await message.channel.send({ embed });
  } catch (error) {
    console.error(error);
  }
}

const translationProgressTrigger = createTrigger(
  'translationprogress',
  runner,
  ['tprogress']
);

module.exports = translationProgressTrigger;
