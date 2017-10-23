const FS = require('fs-extra');

function loadConfig() {
  let config = {};

  let content = FS.readFileSync(__dirname + '/../server/views/article.html').toString();
  config.header = content.match(/<a name="header(.*?)"/)[1] || '';

  return config;
}

module.exports = { loadConfig };
