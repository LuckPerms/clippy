const stringSimilarity = require('string-similarity');

/**
 * @type {Trigger[]}
 */
const triggers = [ ...require('./get-triggers') ];
triggers.push(require('./help-trigger')(triggers));

const triggerAliases = triggers.reduce((arr, cur) => [ ...arr, ...cur.triggers ], []);

console.log(`Loaded ${triggers.length} triggers with ${triggerAliases.length} aliases`);

module.exports = function (client) {
  client.on('message', async message => {
    // Ignore DMs and messages that don't start with the prefix
    if (message.channel.type !== 'text') return;
    if (!message.content.startsWith('!') || message.author.bot) return;

    // Grab the command
    const triggerString = message.content.toLowerCase().substring(1).split(' ')[0].replace(/[^0-9a-z]/gi, '');

    // Ignore if triggerString is blank
    if (!triggerString) {
      return;
    }

    let trigger;

    if (triggerAliases.includes(triggerString)) {
      trigger = triggers.find(t => t.triggers.includes(triggerString));
    }

    if (!trigger) {
      // Check if they slightly misspelt a command and give a hint
      let response = `Sorry! I do not understand the command \`${triggerString}\` `;
      const matches = stringSimilarity.findBestMatch(triggerString, triggerAliases);
      const bestMatch = matches?.bestMatch;
      if (bestMatch.rating >= (process.env.SIMILARITY_SENSITIVITY ?? 0.5)) {
        response += `Did you mean \`${bestMatch.target}\`?`;
      }
      response += '\nType `!help` for a list of commands';
      await message.channel.send(response);
      return;
    }

    trigger.action(triggerString, message);
  });
};
