const mimeType = require('mime-types');
const axios = require('axios');

const contentTypes = ['application/json', 'text/plain', 'text/yaml'];
const bytebin = 'https://bytebin.lucko.me';

module.exports = client => {
    client.on('message', async message => {
        if (message.channel.type !== 'text' || message.author.bot) return;
        if (!message.attachments) return;
        for (const attachment of message.attachments.values()) {
            if (!contentTypes.some(type => mimeType.lookup(attachment.url) === type)) continue;
            try {
                let content = await axios.get(attachment.url);
                let response = await axios.post(`${bytebin}/post`, content.data, {
                    headers: {'Content-Type': 'text/raw'}
                });
                await message.channel.send(`Please use ${bytebin} to send files in the future. I have automatically uploaded \`${attachment.filename}\` for you: ${bytebin}/${response.data.key}`);
            } catch (e) {
                await message.channel.send(`Your file could not be automatically uploaded to bytebin. Please use ${bytebin} to share files.`)
            }
        }
    })
}