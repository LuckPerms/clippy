const { MessageEmbed } = require('discord.js');
const store = require("./store");

module.exports = function (client) {
    client.on('message', async message => {
        // Ignore bots, DMs, etc
        if (!message.author || !message.channel || !message.guild) return;

        // Ensure we have crosspost checks enabled for this channel before doing anything
        if (!store.channelEnabled(message.channel)) return;

        // Check if the user has already recently posted a very similar message
        let previousMessage = store.findMatch(message);

        if (previousMessage) {
            // Remove the message from the cache so a double-warning isn't possible
            store.removeMessage(previousMessage);
            // Reply with warning message
            await message.reply(
                new MessageEmbed()
                    .setTitle(`<:crosspost:999440431521742928> It looks like you already posted that...`)
                    .setColor(`#94df03`)
                    .setURL(`https://discord.com/channels/${previousMessage.guild.id}/${previousMessage.channel.id}/${previousMessage.id}`)
                    .setDescription(
                        `<@${message.author.id}> sent the same message to <#${previousMessage.channel.id}> <t:${(message.createdTimestamp / 1000).toFixed(0)}:R>.
                        
                        It's best to ask your question in just a single channel otherwise it can cause confusion between those trying to help!`
                    )
            );
        } else {
            // Else, log the message in case the user crossposts it in future
            store.addMessage(message);
        }
    });
};
