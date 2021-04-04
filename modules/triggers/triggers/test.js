const createTrigger = require('../create-trigger');

const testTrigger = createTrigger(
  'test',
  function action() {
    console.log('TEST');
  },
  ['teeest'],
);

module.exports = testTrigger;
