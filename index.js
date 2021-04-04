require('dotenv').config();

const discord = require('discord.js');
const fs = require('fs');

const client = new discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

fs.readdirSync(`${__dirname}/modules`)
    .map(mod => {
      console.log("Loading module: " + mod);
      return `./modules/${mod}`;
    })
    .map(mod => require(mod))
    .forEach(mod => mod(client));

client.login(process.env.DISCORD_BOT_TOKEN);
