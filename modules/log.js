const discord = require("discord.js");
var dateFormat = require('dateformat');
const fs = require("fs");

const getLogFileName = (date) => dateFormat(date, "yyyy-mm-dd")
const getLogFileTime = (date) => dateFormat(date, "hh-MM-ss TT")

module.exports = (client) => {
  client.on("message", (message) => {
    var log = `${getLogFileTime()} [INFO] [${message.channel.name}] ${message.author.tag}: ${message.content}\n`
    fs.appendFile(
      getLogFileName(), 
      log,
      function (err) {
        if (err) console.log(err);
      }
    )
  })
}
