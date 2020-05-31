const discord = require('discord.js');

// Import commands and sort by alphabetical order (for !help command)
const commands = require('./list.json').sort((a, b) => {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
});

// For !help command
const splitCommands = (start, end) => {
  return commands.slice(start, end).reduce((prev, command, index) => {
    return prev ? prev + `\n\`!${command.name}\`` : `\`!${command.name}\``;
  }, '');
};

const leftList = splitCommands(0, Math.ceil(commands.length / 2));
const rightList = splitCommands(Math.ceil(commands.length / 2));

module.exports = function (client) {
  client.on('message', async message => {
    // Ignore DMs and messages that don't start with the prefix
    if (message.channel.type !== 'text') return;
    if (!message.content.startsWith('!') || message.author.bot) return;

    // Grab the command
    const trigger = message.content.toLowerCase().substring(1).split(' ')[0].replace(/[^0-9a-z]/gi, '');
    
    // Ignore if trigger is blank
    if (!trigger) return;

    // Initiate the embed
    let embed = new discord.RichEmbed();

    // !help command
    if (trigger === 'help') {
      embed
          .setColor('#94df03')
          .setTitle('Available commands:')
          .addField('\u200E', leftList, true)
          .addField('\u200E', rightList, true);

      await message.channel.send({ embed });
      return;
    }

    // Check if command name exists
    let item = commands.find(command => {
      return command.name === trigger;
    });

    // Check for an alias
    if (!item) {
      item = commands.find(command => {
        if (!command.aliases) return;
        return command.aliases.includes(trigger);
      });
    }

    // If no command found, throw an error
    if (!item) {
      await message.channel.send(`Sorry! I do not understand the command \`!${trigger}\`\nType \`!help\` for a list of commands.`);
      return;
    }

    // Begin formatting the command embed
    embed
        .setColor('#94df03')
        .setDescription(item.description);

    if (item.url) {
      embed.setURL(item.url);
    }

    if (item.wiki) {
      embed
          .setTitle(`🔖 ${item.title}`)
          .addField('Read more', item.url)
          .setFooter('LuckPerms wiki', 'https://luckperms.net/assets/logo/80px.png');
    } else {
      embed.setTitle(`${item.title}`);

      if (item.url) {
        embed.addField('Link', item.url);
      }
    }

    if (item.fields) {
      item.fields.forEach(field => {
        embed.addField(field.key, field.value, field.inline);
      });
    }

    await message.channel.send({ embed });
  });
};
