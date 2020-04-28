# clippy
> *It looks like you are trying to understand this bot*

clippy is our small Office Assistant:tm: bot used on the [LuckPerms Discord](https://discord.gg/luckperms) to aid with support tasks like providing useful links to the wiki or reminding people to not tag staff members.

## Commands
A full list of commands can be found in [`modules/commands/list.json`](https://github.com/LuckPerms/clippy/blob/master/modules/commands/list.json) or by using `!help` in Discord.

## Contributions
### Commands
New commands should be added to the [`list.json` configuration file](https://github.com/LuckPerms/clippy/blob/master/modules/commands/list.json).

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
