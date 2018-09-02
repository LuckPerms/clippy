const data = require("../data.json")


// Structure:
// [
//    {
//        exp: timestamp_it_should_expire_at,
//        member: member_id
//        staff: staff_id
//    }
// ]


var replyCache = [];

function garbageCollect() {
    // Remove any expired entries
    replyCache = replyCache.filter( ob => ob.exp < Date.now() )
}

const is_in_reply_cache = (member, staff) => Object.values(replyCache)
    .filter(rc => rc.member === member.id)
    .filter(rc => rc.staff == staff.id)
    .filter(rc => rc.exp > Date.now()).length > 0;

async function no_ping_staff_handler(msg) {
    msg.mentions.members.forEach(member => {
        replyCache.push({ // Set the key in the reply cache
            exp: Date.now() + (1000 * 60 * 10), // Set expiry for in 10 minutes time
            member: member.id,
            staff: msg.member.id
        })
    })
}

async function no_ping_regular_handler(msg) {
    if (msg.mentions.members
        // If the staff member pinged them in the last 10 minutes, let them off
        .filter(pinged_member => !is_in_reply_cache(msg.member, pinged_member))

        // If there are still some pings that are against the rules
        .some(member => {
            // If the message mentions any members that satisfy the following:
            return member.roles.some(role => data.staff_roles.indexOf(role.name) !== -1)
    // Tell them off:
    })) await msg.channel.send(`Hey ${msg.author.username}! Please don't tag staff members.`)
}

module.exports = function (client) {
    // Start gc'ing
    setInterval(garbageCollect, 20000);


    client.on("message", async msg => {
        // Ignore DMs and messages that don't mention anyone
        if (msg.channel.type !== "text") return;
        if (msg.mentions.members.size === 0) return;

        var sender_is_staff = msg.member.roles.some(role => data.staff_roles.indexOf(role.name) !== -1);
        
        await (sender_is_staff ? no_ping_staff_handler : no_ping_regular_handler)(msg)  
    })
}