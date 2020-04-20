# Clippy
> *It looks like you are trying to understand this bot*

Clippy is a small bot used in the [LuckPerms Discord](https://discord.gg/luckperms) for minor support-tasks like providing useful links to the wiki or reminding People to not tag Staff members.

## Commands
A full list of commands can be found in [`modules/commands/list.json`](https://github.com/LuckPerms/clippy/blob/master/modules/commands/list.json) or by just using `!help` on the Discord.

## Contributions
### Commands
New commands should be added towards the [`list.json` file](https://github.com/LuckPerms/clippy/blob/master/modules/commands/list.json)

Make sure to follow the syntax:  
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
Additionally can you set your own embed fields using the following synax (`fields` would be on the same level as `name`)  
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
