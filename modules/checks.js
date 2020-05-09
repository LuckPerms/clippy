const axios = require('axios');
const RichEmbed = require('discord.js').RichEmbed;
const checks = [
    {regex: /https?:\/\/hastebin\.com\/(\w+)(?:\.\w+)?/g, getLink: 'https://hastebin.com/raw/{code}'},
    {regex: /https?:\/\/hasteb\.in\/(\w+)(?:\.\w+)?/g, getLink: 'https://hasteb.in/raw/{code}'},
    {regex: /https?:\/\/paste\.helpch\.at\/(\w+)(?:\.\w+)?/g, getLink: 'https://paste.helpch.at/raw/{code}'},
    {regex: /https?:\/\/bytebin\.lucko\.me\/(\w+)/g, getLink: 'https://bytebin.lucko.me/{code}'},
    {regex: /https?:\/\/paste\.lucko\.me\/(\w+)(?:\.\w+)?/g, getLink: 'https://paste.lucko.me/raw/{code}'},]
const tests = [
    {checks: [/Caused by: java\.util\.concurrent\.CompletionException: java\.sql\.SQLTransientConnectionException: luckperms - Connection is not available, request timed out after \d+ms\./,
        /Caused by: java\.sql\.SQLTransientConnectionException: luckperms - Connection is not available, request timed out after \d+ms\./,
        /luckperms - Failed to validate connection com\.mysql\.jdbc\.JDBC4Connection@\w+ \(Communications link failure\)/,
        /The last packet successfully received from the server was \d+ milliseconds ago\. The last packet sent successfully to the server was \d+ milliseconds ago\./],
    title: 'Luckperms cannot connect to your MySQL server',
    link: 'https://github.com/lucko/LuckPerms/wiki/Storage-system-errors#luckperms-cannot-connect-to-my-mysql-server'},

    {checks: [/Establishing SSL connection without server's identity verification is not recommended\./],
    title: 'MySQL SSL Error',
    link: 'https://github\.com/lucko/LuckPerms/wiki/Storage-system-errors#mysql-ssl-errors'},

    {checks: [/me\.lucko\.luckperms\.lib\.hikari\.pool\.PoolBase - luckperms-hikari - Failed to validate connection me\.lucko\.luckperms\.lib\.mysql\.jdbc\.JDBC4Connection@\w+ \(No operations allowed after connection closed\\.\)/,
        /me\.lucko\.luckperms\.lib\.hikari\.pool\.PoolBase - luckperms-hikari- Failed to validate connection me\.lucko\.luckperms\.lib\.mariadb\.MariaDbConnection@\w+ \(\w+ cannot be called on a closed connection\)/],
    title: 'MySQL "No operations allowed after connection closed" error',
    link: 'https://github.com/lucko/LuckPerms/wiki/Storage-system-errors#mysql-no-operations-allowed-after-connection-closed-error'},

    {checks: [/Caused by: com\.mysql\.jdbc\.exceptions\.jdbc4\.MySQLSyntaxErrorException: User '\w+' has exceeded the 'max_user_connections' resource \(current value: \w+\)/,],
    title: 'MySQL exceeded max connections',
    link: 'https://https://github.com/lucko/LuckPerms/wiki/Storage-system-errors#mysql-exceeded-max-connections'},
]
module.exports = function (client) {
    client.on('message', async message => {
        if (message.channel.type !== 'text' || message.author.bot) return;
        let getLink = '';
        let originalLink = '';
        checks.forEach(pastebin => {
            let match = pastebin.regex.exec(message.content);
            if (match) {
                getLink = pastebin.getLink.replace('{code}', match[1]);
                originalLink = match[0];
            }
        })
        if (!getLink) return;
        let response = '';
        try {
            console.log(`Getting pastebin ${getLink}`)
            response = (await axios.get(getLink)).data;
        } catch (e) {
            if (e.response) {
                await message.channel.send(new RichEmbed()
                    .setTitle(`${e.response.status} ${e.response.statusText}`)
                    .setColor('#FF0000')
                    .setFooter(`${originalLink} | Sent by ${message.author.username}`))
            }
            return;
        }
        if (!response) return;
        for (let test of tests) {
            let matched = false;
            let cause = '';
            for (let check of test.checks) {
                let match = check.exec(response)
                if (match) {
                    matched = true;
                    cause = match;
                }
            }
            if (matched) {
                let embed = new RichEmbed();
                embed.setTitle(test.title);
                if (test.description) embed.setDescription(test.description);
                if (test.link) embed.addField('Read More', test.link);
                embed.addField('Caused By', `\`\`\`${cause}\`\`\``)
                embed.setFooter(`${originalLink} | Sent by ${message.author.username}`)
                embed.setColor('#96dd35')
                await message.channel.send(embed);
            }
        }
    })
}