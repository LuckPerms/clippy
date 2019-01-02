const data = require("../data.json");

module.exports = function (client) {
    client.on("message", async msg => {
        // Ignore DMs and messages that don't mention anyone
        if (msg.channel.type !== "text") return;
        if (msg.mentions.members.size === 0) return;

        const senderIsStaff = msg.member.roles.some(role => data.staff_roles.indexOf(role.name) !== -1);
        if (senderIsStaff) {
            return;
        }

        const mentionsStaff = msg.mentions.members.some(member => {
            // If the message mentions any members that satisfy the following:
            return member.roles.some(role => data.staff_roles.indexOf(role.name) !== -1);
        });

        if (mentionsStaff) {
            // Tell them off:
            await msg.channel.send(`Hey ${msg.author.username}! Please don't tag staff members.`);
        }
    });
};
