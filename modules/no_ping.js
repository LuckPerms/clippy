const data = require("../data.json")
const fs = require("mz/fs");

module.exports = function (client) {

    client.on("message", async msg => {
        // Ignore DMs and messages that don't mention anyone
        if (msg.channel.type !== "text") return;
        if (msg.mentions.members.size === 0) return;

        var sender_is_staff = msg.member.roles.some(role => data.staff_roles.indexOf(role.name) !== -1);
        if (!sender_is_staff) {
            if (msg.mentions.members
                    // If there are staff pings
                    .some(member => {
                        // If the message mentions any members that satisfy the following:
                        return member.roles.some(role => data.staff_roles.indexOf(role.name) !== -1)
    
                    })
            ) {
                // Tell them off:
                await msg.channel.send(`Hey ${msg.author.username}! Please don't tag staff members.`)
            }

        }
        
    })
}