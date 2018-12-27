const discord = require("discord.js");
const fs = require("fs");

function getLogFileName() {
  var d = new Date();
  return `${d.getYear() + 1900}-${d.getMonth() + 1}-${d.getDate()}.log`
}

function getLogFileTime() {
  var d = new Date();
  return `${((d.getHours() + 1) > 12) ? ((d.getHours() + 1) - 12) : (d.getHours() + 1)}:${d.getMinutes()}:${d.getSeconds()} ${((d.getHours() + 1) > 12) ? "PM" : "AM"}`
}

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
