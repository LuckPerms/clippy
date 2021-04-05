require('dotenv').config();

const discord = require('discord.js');
const fs = require('fs');

const client = new discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const modules = fs.readdirSync(`${__dirname}/modules`).map(module => {
  console.log(`Loading module: ${module}`);
  return require(`./modules/${module}`);
});

modules.forEach(module => module(client));

console.log(`Loaded ${modules.length} modules`);

client
  .login(process.env.DISCORD_BOT_TOKEN)
  .then(() => console.log('✅ Ready'))
  .catch(console.error);
