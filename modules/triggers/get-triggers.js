const fs = require('fs');

const triggerFiles = fs.readdirSync(`${__dirname}/triggers`);

const triggers = [];

for (const file of triggerFiles) {
  console.log(`Loading trigger: ${file}`);
  triggers.push(require(`./triggers/${file}`));
}

module.exports = triggers;
