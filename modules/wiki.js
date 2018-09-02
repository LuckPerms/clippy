const data = require("../data.json")

module.exports = function (client) {
    client.on("message", async msg => {
        // Ignore DMs and messages that don't start with the prefix
        if (msg.channel.type !== "text") return;
        if (!msg.content.startsWith("!")) return;
        
        // Check if command is in the data file. If so, send it
        var wiki_link = data.wiki_links[msg.content.toLowerCase().substring(1)];
        if (wiki_link) await msg.channel.send(`:paperclip: <${wiki_link}>`)
    })
}