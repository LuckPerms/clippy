const legit = [
  "dis.gd",
  "discord.co",
  "discord.com",
  "discord.design",
  "discord.dev",
  "discord.gg",
  "discord.gift",
  "discord.gifts",
  "discord.media",
  "discord.new",
  "discord.store",
  "discord.tools",
  "discordapp.com",
  "discordapp.net",
  "discordmerch.com",
  "discordpartygames.com",
  "discord-activities.com",
  "discordactivities.com",
  "discordsays.com",
  "discordstatus.com",
  "discordapp.io",
  "discord4j.com",
  "steamcommunity.com",
  "steamgames.com",
  "steampowered.com",
  "discordcdn.com"
]

module.exports = (client) => {
  client.on('message', async (msg) => {
    if (msg.channel.type !== 'text') return;
    if (!msg.content || !msg.member) return;
    if (msg.member.user.bot) return;

    let badDomain;
    const matches = msg.content.matchAll(/https?:\/\/((?:(?:d+[i1l]+[csz]+)|(?:s+[t]+[er]+))[\w.-]+)/gm);
    for (const match of matches) {
      const domain = match[1];
      if (!legit.includes(domain)) {
        badDomain = domain;
        break;
      }
    }

    if (badDomain) {
      await msg.delete();

      const channel = msg.guild.channels.resolve(process.env.DISCORD_PUNISHMENTS_CHANNEL);
      await channel.send(`Deleted message from ${msg.author.username} (${msg.author.id}) containing likely scam link \`${badDomain}\``);
    }
  });
};
  