const config = require('./checks.config');
const axios = require('axios');
const MessageEmbed = require('discord.js').MessageEmbed;

module.exports = function (client) {
  client.on('message', async message => {
    if (message.channel.type !== 'text') return;

    let getLink = '';
    let originalLink = '';

    config.checks.every(element => {
      let match = element.regex.exec(message.content);
      if (match) {
        getLink = element.getLink.replace('{code}', match[1]);
        originalLink = match[0];
        return false;
      } else {
        return true;
      }
    });

    if (!getLink) return;
    let response = '';
    try {
      //console.log(`Getting pastebin ${getLink}`);
      response = (await axios.get(getLink)).data;
    } catch (e) {
      if (e.response) {
        if (e.response.status === 404) {
          await message.channel.send(
            new MessageEmbed()
              .setTitle('Invalid Paste!')
              .setColor('#FF0000')
              .setDescription(
                'The paste link you sent in is invalid or expired, please check the link or paste a new one.'
              )
              .setFooter(`${originalLink} | Sent by ${message.author.username}`)
          );
        }
      }
      return;
    }

    if (!response) return;

    for (let test of config.tests) {
      let matched = false;
      let cause = '';

      for (let check of test.checks) {
        let match = check.exec(response);
        if (match) {
          matched = true;
          cause = match;
        }
      }

      if (matched) {
        let embed = new MessageEmbed();
        embed.setTitle(test.title);

        if (test.description) embed.setDescription(test.description);
        if (test.link) embed.addField('Read More', test.link);

        embed.addField('Caused By', `\`\`\`${cause}\`\`\``);
        embed.setFooter(`${originalLink} | Sent by ${message.author.username}`);
        embed.setColor('#96dd35');

        await message.channel.send(embed);
      }
    }
  });
};
