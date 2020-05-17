const mimeType = require('mime-types');
const axios = require('axios');

const contentTypes = ['application/json', 'text/plain', 'text/yaml'];
const bytebin = 'https://bytebin.lucko.me';

module.exports = client => {
    client.on('message', async message => {
        if (message.channel.type !== 'text' || message.author.bot) return;
        if (!message.attachments) return;
        for (let attachment of message.attachments.values()) {
            if (!contentTypes.some(type => mimeType.lookup(attachment.url) === type)) continue;
            let content = await axios.get(attachment.url);
            let response = await axios.post(`${bytebin}/post`, content.data, {
                headers: {'Content-Type': 'text/raw'}
            });
            await message.channel.send(`Automatic upload of  \`${attachment.filename}\`: ${bytebin}/${response.data.key}`);
        }
    })
}