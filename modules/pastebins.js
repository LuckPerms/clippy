const axios = require('axios');
const RichEmbed = require('discord.js').RichEmbed
module.exports = function (client) {
    const pastebins = [{regex: /https?:\/\/hastebin\.com\/(\w+)/g, getLink: 'https://hastebin.com/raw/{code}'},
        {regex: /https?:\/\/hasteb\.in\/(\w+)/g, getLink: 'https://hasteb.in/raw/{code}'},
        {regex: /https?:\/\/paste\.helpch\.at\/(\w+)/g, getLink: 'https://paste.helpch.at/raw/{code}'},
        {regex: /https?:\/\/bytebin\.lucko\.me\/(\w+)/g, getLink: 'https://bytebin.lucko.me/{code}'},]
    client.on('message', async message => {
        if (message.channel.type !== 'text' || message.user.bot) return;
        let getLink;
        let originalLink;
        pastebins.forEach(pastebin => {
            let match = pastebin.regex.exec(message.content);
            if (match) {
                getLink = pastebin.getLink.replace('{code}', match[1]);
                originalLink = match[0];
            }
        })
        if (!getLink) return;

        let embed = new RichEmbed().setTitle(originalLink)
        axios.get(getLink).then(response => {
            if (response.data.length >=  2000)
                embed.setColor('#FF0000').setDescription('Contents exceed 2000 characters')
            else
                embed.setColor('#00FF00').setDescription(response.data)

        }).catch(e => {
            if (e.response)
                embed.setColor('#FF0000').setDescription(`${e.response.status} ${e.response.statusText}`)
            else {
                embed.setColor('#FF0000').setDescription('An internal error occurred.')
                console.error(e)
            }
        }).finally(() => {
            message.channel.send(embed)
        })
    })
}