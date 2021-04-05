const { MessageEmbed } = require('discord.js');
const createTrigger = require('../../create-trigger');
const embeds = require('./list.json');

const aliases = embeds.reduce((acc, cur) => [ ...acc, cur.name, ...cur.aliases || []], []);
const addToHelpList = embeds.map(({ name }) => name);

async function action(trigger, message) {
  if (!aliases.includes(trigger)) {
    return;
  }

  const embedItem = embeds.find(embed => {
    let result = false;
    if (embed.aliases) {
      result = embed.aliases.includes(trigger);
    }
    if (!result) {
      result = embed.name === trigger;
    }
    return result;
  });

  const embed = new MessageEmbed();

  embed
    .setColor('#94df03')
    .setDescription(embedItem.description);

  if (embedItem.url) {
    embed.setURL(embedItem.url);
  }

  if (embedItem.wiki) {
    embed
      .setTitle(`🔖 ${embedItem.title}`)
      .addField('Read more', embedItem.url)
      .setFooter('LuckPerms wiki', 'https://luckperms.net/logo.png');
  } else {
    embed.setTitle(embedItem.title);

    if (embedItem.url) {
      embed.addField('Link', embedItem.url);
    }
  }

  if (embedItem.fields) {
    embedItem.fields.forEach(field => {
      embed.addField(field.key, field.value, field.inline);
    });
  }

  await message.channel.send({ embed });
}

const embedsTrigger = createTrigger('embeds',action,aliases,null,addToHelpList);

module.exports = embedsTrigger;
