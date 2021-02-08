module.exports = {
  checks: [
    { regex: /https?:\/\/hastebin\.com\/(\w+)(?:\.\w+)?/g, getLink: 'https://hastebin.com/raw/{code}' },
    { regex: /https?:\/\/hasteb\.in\/(\w+)(?:\.\w+)?/g, getLink: 'https://hasteb.in/raw/{code}' },
    { regex: /https?:\/\/paste\.helpch\.at\/(\w+)(?:\.\w+)?/g, getLink: 'https://paste.helpch.at/raw/{code}' },
    { regex: /https?:\/\/bytebin\.lucko\.me\/(\w+)/g, getLink: 'https://bytebin.lucko.me/{code}' },
    { regex: /https?:\/\/paste\.lucko\.me\/(\w+)(?:\.\w+)?/g, getLink: 'https://paste.lucko.me/raw/{code}' },
    { regex: /https?:\/\/pastebin\.com\/(\w+)(?:\.\w+)?/g, getLink: 'https://pastebin.com/raw/{code}' },
    { regex: /https?:\/\/gist\.github\.com\/(\w+\/\w+)(?:\.\w+\/\w+)?/g, getLink: 'https://gist.github.com/{code}/raw/' },
    { regex: /https?:\/\/gitlab\.com\/snippets\/(\w+)(?:\.\w+)?/g, getLink: 'https://gitlab.com/snippets/{code}/raw' }
  ],

  tests: [
    {
      checks: [
        /java\.sql\.SQLTransientConnectionException.+Connection is not available, request timed out after \d+ms\./,
        /com\.mysql\.jdbc\.exceptions\.jdbc4\.CommunicationsException.+Communications link failure/
      ],
      title: 'Luckperms cannot connect to your MySQL server',
      link: 'https://luckperms.net/wiki/Storage-system-errors#luckperms-cannot-connect-to-my-mysql-server'
    },
    {
      checks: [/Establishing SSL connection without server's identity verification is not recommended\./],
      title: 'MySQL SSL Error',
      link: 'https://luckperms.net/wiki/Storage-system-errors#mysql-ssl-errors'
    },
    {
      checks: [
        /me\.lucko\.luckperms\.lib\.hikari\.pool\.PoolBase.+Failed to validate connection me\.lucko\.luckperms\.lib\.mysql\.jdbc\.JDBC4Connection@.+ \(No operations allowed after connection closed\.\)/,
        /me\.lucko\.luckperms\.lib\.hikari\.pool\.PoolBase.+Failed to validate connection me\.lucko\.luckperms\.lib\.mariadb\.MariaDbConnection@.+ cannot be called on a closed connection\)/
      ],
      title: 'MySQL "No operations allowed after connection closed" error',
      link: 'https://luckperms.net/wiki/Storage-system-errors#mysql-no-operations-allowed-after-connection-closed-error'
    },
    {
      checks: [
        /.+SyntaxErrorException: User '.+' has exceeded the 'max_user_connections' resource \(current value:.+/,
      ],
      title: 'MySQL exceeded max connections',
      link: 'https://luckperms.net/wiki/Storage-system-errors#mysql-exceeded-max-connections'
    },
  ]
}