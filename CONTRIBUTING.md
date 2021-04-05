# Contributing to this app

The following guide should help you if you wish to contribute to Clippy. Please read through it and ask questions on our [Discord](https://discord.com/luckperms) if you need any help.

## Install and setup

### Requirements

Clippy requires at least Node 14 to run, it's recommended to use [nvm](https://github.com/nvm-sh/nvm#about) to manage Node installations in your environment.

### Installation

Fork/clone this repository then install the dependencies:

```bash
> cd clippy
> npm install
```

### Configure the environment

Copy the contents of `.env.example` to `.env`

```bash
> cp .env.example .env
```

Open `.env` and input the necessary environment variables:

```properties
# Token of the Discord bot to use for this application
DISCORD_BOT_TOKEN =

# Discord role names, separated by a comma
# e.g: helpful,staff
DISCORD_STAFF_ROLES =

# Discord Guild ID
DISCORD_GUILD =

# Discord channel ID of where to send the donor list
DISCORD_PATREON_CHANNEL =

# Discord role ID to add to users when they first join
DISCORD_MEMBER_ROLE =

# Sensitivity for the command trigger - defaults to 0.5
SIMILARITY_SENSITIVITY =
```

### Run the app

Once all the `DISCORD` variables are filled in and correct, run the app with the following command:

```bash
> npm start
```

The app will connect to your Discord bot and listen to events as they come through.

## Development

The app uses [discord.js](https://discord.js.org/), it's recommended to read their documentation while making any edits to Clippy.

Clippy can be broken up into two main features:

- The modules system
- The triggers module

### Modules

Modules reside in the `modules` folder and are automatically imported into the app. Any modules you wish to exclude may be placed in `modules_disabled`.

All modules must export a function that takes a single argument: `client`

For example: 

```js
// my-module.js

const sayHello = (username) => `Hello ${username}!`;

module.exports = (client) => {
  client.on('message', async message => {
    if (!message.conent.startsWith('hello')) {
      return;
    }
    
    try {
      await message.channel.send(sayHello(message.author.username));
    } catch (error) {
      console.log(error);
    }
  });
}
```

You can listen on any of the [discord.js Client](https://discord.js.org/#/docs/main/stable/class/Client) events in a module. It's best to keep as much logic out of the event listeners as possible otherwise you risk overloading the bot.

Complex modules may be added to their own directory to keep code tidy or if the module uses non-JS data like JSON. See the `checks` and `triggers` modules to see an example of this.

### Triggers

Triggers are a module that listen for any messages beginning with the activation character (by default this is `!`).

Creating triggers can be done by adding a file (or a directory as mentioned above for modules) in the `triggers/triggers` directory. The trigger file must require the `createTrigger` function from `modules/triggers/create-trigger.js` and use it to export a new trigger.

For example:

```js
// my-trigger.js

const { MessageEmbed } = require('discord.js');
const createTrigger = require('../create-trigger');

// action function takes the trigger and message properties
async function action(trigger, message) {
  const embed = new MessageEmbed({
    title: 'Boop!'
  });
  
  try {
    await message.channel.send({ embed });
  } catch (error) {
    console.log(error);
  }
}

const beepTrigger = createTrigger('beep', action);

module.exports = beepTrigger;
```

The `createTrigger` function accepts the following arguments:

```js
createTrigger(
  'name', // string - name of the trigger
  action, // function - callback which accepts arguments: 'trigger' and 'message'
  aliases, // array - strings that can call this trigger
  'permission', // string - not yet implemented but determines whether the trigger should fire based on the user's role
  addToHelpList // array - string that should be added to the help list (defaults to a combination of 'name' and 'aliases' properties)
)
```

#### Embeds

Embeds are a legacy trigger that used to be called `commands`. The commands module has been refactored into a trigger. Existing embeds shall be modified here but any new ones may be better off as a new trigger.

New embeds should be added to the [`list.json` configuration file](https://github.com/LuckPerms/clippy/blob/master/modules/triggers/triggers/embeds/list.json).

The basic syntax is as follows:
```json
[
  {
    "name": "command",
    "aliases": [
      "aliases",
      "go",
      "here"
    ],
    "title": "Title of the Embed",
    "url": "https://example.com",
    "description": "A small description about what info the command provides",
    "wiki": true
  }
]
```

The option `wiki` is used together with the `url` field to add a separate embed field with the title `Read more:` and the URL as value.

Additionally you can set your own embed fields using the following syntax (`fields` would be on the same level as `name`)
```json
[
  {
    "fields": [
      {
        "key": "Title of field",
        "value": "Field description",
        "inline": true
      }
    ]
  }
]
```
