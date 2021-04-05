const dateFormat = require('dateformat');
const fs = require('fs');

const LOG_PATH = './logs/';

// Create log folder if absent
if (!fs.existsSync(LOG_PATH) || !fs.lstatSync(LOG_PATH).isDirectory()) {
  console.log('Did not find log folder, creating it.');
  fs.mkdir(LOG_PATH, err => {
    if (err) throw err;
  });
}

const getLogFileName = date =>
  LOG_PATH + dateFormat(date, 'yyyy-mm-dd') + '.log';
const getLogFileTime = date => dateFormat(date, 'hh-MM-ss TT');

module.exports = client => {
  client.on('message', message => {
    const log = `${getLogFileTime()} [${message.channel.name}] ${
      message.author.tag
    }: ${message.content}\n`;
    fs.appendFile(getLogFileName(), log, function (err) {
      if (err) {
        console.log(err);
      }
    });
  });
};
