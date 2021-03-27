const mimeType = require('mime-types');
const axios = require('axios');

const contentTypes = ['application/json', 'text/plain', 'text/yaml'];
const bytebin = 'https://bytebin.lucko.me';
const paste = 'https://paste.lucko.me';

module.exports = client => {
  client.on('message', async message => {
    if (message.channel.type !== 'text' || message.author.bot) return;
    if (!message.attachments) return;
    for (const attachment of message.attachments.values()) {
      let contentType = mimeType.lookup(attachment.url);
      if (!contentTypes.some(type => contentType === type)) continue;
      if (attachment.name.endsWith('.log')) {
        contentType = 'text/log';
      }
      try {
        let content = await axios.get(attachment.url);
        let response = await axios.post(`${bytebin}/post`, content.data, {
          headers: {'Content-Type': contentType}
        });
        await message.channel.send(`Please use ${paste} to send files in the future. I have automatically uploaded \`${attachment.name}\` for you: ${paste}/${response.data.key}`);
      } catch (e) {
        await message.channel.send(`Your file could not be automatically uploaded. Please use ${paste} to share files.`)
      }
    }
  })
}
