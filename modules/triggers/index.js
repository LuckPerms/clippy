const stringSimilarity = require('string-similarity');

/**
 * @type {Trigger[]}
 */
const triggers = [...require('./get-triggers')];
triggers.push(require('./help-trigger')(triggers));

const triggerAliases = triggers.reduce(
  (arr, cur) => [...arr, ...cur.triggers],
  []
);

console.log(
  `Loaded ${triggers.length} triggers with ${triggerAliases.length} aliases`
);

const findTrigger = triggerString => {
  if (triggerString && triggerAliases.includes(triggerString)) {
    return triggers.find(t => t.triggers.includes(triggerString));
  }
  return null;
};

const TYPO_REACTION = '🔧';

module.exports = function (client) {
  client.on('message', async message => {
    // Ignore DMs and messages that don't start with the prefix
    if (message.channel.type !== 'text') return;
    if (!message.content.startsWith('!') || message.author.bot) return;

    // Grab the command
    const triggerString = message.content
      .toLowerCase()
      .substring(1)
      .split(' ')[0]
      .replace(/[^0-9a-z]/gi, '');

    // Ignore if triggerString is blank
    if (!triggerString) {
      return;
    }

    const trigger = findTrigger(triggerString);
    if (!trigger) {
      // Check if they slightly misspelt a command and give a hint
      let response = `Sorry! I do not understand the command \`${triggerString}\` `;
      const matches = stringSimilarity.findBestMatch(
        triggerString,
        triggerAliases
      );

      const bestMatch = matches?.bestMatch;
      let foundPotentialMatch = false;

      if (bestMatch.rating >= (process.env.SIMILARITY_SENSITIVITY ?? 0.5)) {
        response += `Did you mean \`${bestMatch.target}\`?`;
        foundPotentialMatch = true;
      }

      response += '\nType `!help` for a list of commands';
      const botMessage = await message.channel.send(response);

      if (!foundPotentialMatch) return;

      const match = findTrigger(bestMatch.target);
      if (!match) return;

      // React to show the the best match, 1 minute timeout.
      const typoReact = await botMessage.react(TYPO_REACTION);
      botMessage
        .awaitReactions(r => r.emoji.name === TYPO_REACTION, {
          max: 1,
          time: 60000,
          errors: ['time'],
        })
        .then(async collected => {
          const reaction = collected.first();
          if (reaction.emoji.name !== TYPO_REACTION) return;

          match.action(bestMatch.target, message);

          await botMessage.delete();
        })
        .catch(async () => await typoReact.remove());

      return;
    }

    trigger.action(triggerString, message);
  });
};
