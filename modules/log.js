

function getLogFileName() {
  var d = new Date()
  return `${d.getYear() + 1900}-${d.getMonth() + 1}-{d.getDate()}.log`
}
