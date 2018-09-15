const data = require("../data.json")
const fs = require("mz/fs");

async function no_ping_regular_handler(msg) {
    var allowed = await fs.readFile("./ping_allowed", "utf-8").split("\n");
    if (allowed.contains(msg.member.id)) return;
    if (msg.mentions.members
        // If there are staff pings
        .some(member => {
            // If the message mentions any members that satisfy the following:
            return member.roles.some(role => data.staff_roles.indexOf(role.name) !== -1)
    // Tell them off:
    })) await msg.channel.send(`Hey ${msg.author.username}! Please don't tag staff members.`)
}

module.exports = function (client) {

    client.on("message", async msg => {
        // Ignore DMs and messages that don't mention anyone
        if (msg.channel.type !== "text") return;
        if (msg.mentions.members.size === 0) return;

        var sender_is_staff = msg.member.roles.some(role => data.staff_roles.indexOf(role.name) !== -1);
        if (!sender_is_staff) await no_ping_regular_handler(msg)
        
    })
}