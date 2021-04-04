/**
 * @type {Trigger[]}
 */
const triggers = [ ...require('./get-triggers') ];
triggers.push(require('./help-trigger')(triggers));

console.log('triggers', triggers);

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

    const trigger = triggers.find(t => t.triggers.includes(triggerString));

    if (!trigger) {
      console.log(`${triggerString} doesn't exist`);
      return;
    }

    trigger.action(trigger, message);
  });
};
