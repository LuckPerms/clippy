const discord = require("discord.js");
const fs = require("fs");

function pad(s, l) {
  l = l ? l : 2 // set to 2 if undefined
  s = s.toString() // make sure
  return (("0".repeat(l)).substring(0, l - s.length) + s)
}

function getLogFileName() {
  var d = new Date();
  return `${d.getYear() + 1900}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.log`
}

function getLogFileTime() {
  var d = new Date();
  return `${(d.getHours() > 12) ? pad(d.getHours() - 12) : pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${(d.getHours() > 12) ? "PM" : "AM"}`
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
