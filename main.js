const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("mz/fs"); // mz/fs works exactly the same as fs but with promises
const path = require("path");

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

var modules = fs.readdirSync("modules")
    .map( mod => `./modules/${mod}` ) // Make into paths
    .map( mod => require(mod) ) // Load each module
    .forEach(mod => mod(client) ) // Call it's function

client.login(config.token);