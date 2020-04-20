const discord = require('discord.js');
const config = require('./config.json');
const fs = require('mz/fs'); // mz/fs works exactly the same as fs but with promises

const client = new discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

fs.readdirSync('modules')
    .map(mod => `./modules/${mod}`)
    .map(mod => require(mod))
    .forEach(mod => mod(client));

client.login(config.token);
