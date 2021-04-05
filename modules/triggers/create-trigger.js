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
 * @param {function} runner
 * @param {string[]} [aliases]
 * @param {string[]|null} [permissions=null]
 * @param {?string[]|null} [addToHelpList]
 * @returns {Trigger}
 */
const createTrigger = (
  name,
  runner,
  aliases,
  permissions = null,
  addToHelpList
) => {
  if (!name) {
    throw new Error('A name is required for triggers');
  }

  if (runner === undefined) {
    throw new Error(`Trigger "${name}" action must have an action`);
  }

  if (typeof runner !== 'function') {
    throw new Error(`Trigger "${name}" action must be a function`);
  }

  const triggers = [name, ...aliases];

  const hasPermissions = message => {
    if (!permissions) return true;
    for (const perm of permissions) {
      if (!message.member.hasPermission(perm)) return false;
    }
    return true;
  };

  const action = (trigger, message) => {
    if (!hasPermissions(message)) return;
    runner(trigger, message);
  };

  return {
    name,
    aliases,
    triggers,
    action,
    permissions,
    helpList: addToHelpList || [name],
  };
};

module.exports = createTrigger;
