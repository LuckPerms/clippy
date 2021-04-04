/**
 * @typedef {Object} Trigger
 * @property {string} name - name of the trigger
 * @property {string[]} aliases - alternative triggers
 * @property {?string[]} triggers - combined array of name + aliases
 * @property {function} action - what to do when the trigger is fired
 * @property {?string} permission - the permission
 * @property {?string[]} helpList - array of triggers to add to the help list
 */

/**
 * Creates and returns a new Trigger
 * @param {string} name
 * @param {function} action
 * @param {string[]} [aliases]
 * @param {string|null} [permission=null]
 * @param {?string[]|null} [addToHelpList]
 * @returns {Trigger}
 */
const createTrigger = (
  name,
  action,
  aliases,
  permission = null,
  addToHelpList,
) => {
  if (!name) {
    throw new Error('A name is required for triggers');
  }

  if (action === undefined) {
    throw new Error(`Trigger "${name}" action must have an action`)
  }

  if (typeof action !== 'function') {
    throw new Error(`Trigger "${name}" action must be a function`);
  }

  const triggers = [name, ...aliases];

  return {
    name,
    aliases,
    triggers,
    action,
    permission,
    helpList: addToHelpList || [ name ],
  };
};

module.exports = createTrigger;
