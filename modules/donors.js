const axios = require('axios');

async function update(client) {
  try {
    await update(client);
  } catch (e) {
    console.error('error while updating donors', e);
  }
}

async function doUpdate(client) {
  const donorsInfo = await axios.get(
    'https://metadata.luckperms.net/data/donors'
  );

  const donors = donorsInfo.data.donors;
  const donorNames = [];
  for (const donor of donors) {
    let name = donor.name;
    if (donor.discord) {
      const discordUser = await client.users.fetch(donor.discord);
      if (discordUser) {
        name = discordUser.username;
      }
    }
    donorNames.push(name);
  }

  donorNames.sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );

  let text =
    '🖼️ **Hall of Fame** 🖼️\n\nSpecial thanks goes to the following people for their kind donations and/or support of the project on Patreon.\n(this list is those who have pledged $5 or more & have made their pledges publicly visible in their Patreon profile)\n\n';
  for (const name of donorNames) {
    text += '⇒ ' + name + '\n';
  }

  const guild = await client.guilds.fetch(process.env.DISCORD_GUILD);
  const channel = guild.channels.resolve(process.env.DISCORD_PATREON_CHANNEL);
  const messages = await channel.messages.fetch({ limit: 10 });

  for (const message of messages.values()) {
    if (message.author.bot) {
      await message.edit(text);
      return;
    }
  }
  await channel.send(text);
}

module.exports = client => {
  client.once('ready', async () => {
    await update(client);
    setInterval(async () => {
      await update(client);
    }, 21600000); // 6 hours
  });
};
