const data = require("../data.json");
const discord = require('discord.js');

module.exports = function (client) {
    client.on("message", async msg => {
        // Ignore DMs and messages that don't start with the prefix
        if (msg.channel.type !== "text") return;
        if (!msg.content.startsWith("!") || msg.author.bot) return;

        const trigger = msg.content.toLowerCase().substring(1).split(" ")[0].replace(/[^0-9a-z]/gi, '');

        let embed = new discord.RichEmbed();

        if (trigger === 'help') {
            const listArray = data.wiki_links.sort((a, b) => {
                if (a.command < b.command) return -1;
                if (a.command > b.command) return 1;
                return 0;
            });

            let list = '';

            listArray.forEach(link => {
                list += '`!' + link.command + '`\n';
            });

            embed
                .setColor('#94df03')
                .setTitle(`Available commands:`)
                .setDescription(list);
        } else {
            // Check if command is in the data file. If so, send it
            const item = data.wiki_links.find(link => {
                return link.command === trigger;
            });

            if (!item) return;

            embed
                .setColor('#94df03')
                .setTitle(`🔖 ${item.title}`)
                .setURL(item.url)
                .setDescription(item.description)
                .addField('Read more:', item.url)
                .setFooter('LuckPerms wiki', 'https://luckperms.net/assets/logo/80px.png');

            if (item.fields) {
                item.fields.forEach(field => {
                    embed.addField(field.key, field.value);
                });
            }
        }

        await msg.channel.send({ embed });
    });
};
