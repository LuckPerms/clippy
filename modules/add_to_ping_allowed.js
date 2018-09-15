const fs = require("mz/fs");
const data = require("../data.json");
async function resolve_member(guild, member) {
    if (member.startsWith("<")) {
        // Probably a mention. Strip it, check it
        var possible = member.replace(/[^\d]+/g, "")
        possible = guild.members.get(possible)
        if (possible) return possible;
    }
    // If we have a member with a username mentioned, return that
    if (guild.members.map(m => m.user).find("username", member)) {
        return guild.members.get(guild.members.map(m => m.user).find("username", member).id);
    }

    // Direct ID?
    if (guild.members.get(member)) return guild.members.get(member);
}

module.exports = function (client) {
    client.on("message", async msg => {
        // Ignore DMs
        if (msg.channel.type !== "text") return;
        if (msg.author.bot) return;
        // True if member has a staff role
        var sender_is_staff = msg.member.roles.some(role => data.staff_roles.indexOf(role.name) !== -1);
        if (!sender_is_staff) return;

        // We know they're staff now.

        // Check command invocation
        if (!msg.content.startsWith("!whitelist")) return;


        var member = await resolve_member(msg.guild, msg.contents.split(" ").subarray(1).join(" "));
        if (!member) return msg.reply("Couldn't resolve member :(");
        fs.appendFile("./ping_allowed", member.id);
        msg.reply("Added")

    })
}