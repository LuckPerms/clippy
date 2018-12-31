const data = require("../data.json")

module.exports = function (client) {
    client.on("message", async msg => {
        // Ignore DMs and messages that don't start with the prefix
        if (msg.channel.type !== "text") return;
        if (!msg.content.startsWith("!") || msg.author.bot) return;
        
        // Check if command is in the data file. If so, send it
        var wiki_link = data.wiki_links[msg.content.toLowerCase().substring(1)];
        if (wiki_link) await msg.channel.send(`:bookmark: Wiki: \`` + msg.content.toLowerCase().substring(1) + `\`\n${wiki_link}`)
    })
}
