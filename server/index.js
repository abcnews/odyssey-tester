const express = require('express');
const EJS = require('ejs');
const BodyParser = require('body-parser');
const FS = require('fs-extra');
const Chalk = require('chalk');
const Request = require('request');

const { loadConfig } = require('../lib/loader');

const app = express();

app.set('view engine', 'html');
app.engine('html', EJS.renderFile);
app.set('views', [`${__dirname}/views`]);
app.use(BodyParser.json());
app.use('/', express.static(__dirname + '/public'));

app.set('config', loadConfig());

app.get('/', (request, response) => {
  const config = request.app.get('config');
  response.render('index', { config });
});

app.post('/update', (request, response) => {
  request.app.set('config', request.body);
  response.json(request.app.get('config'));
});

app.get('/preview', (request, response) => {
  const config = request.app.get('config');

  let content = FS.readFileSync(__dirname + '/views/article.html').toString();
  content = content.replace(/<a name="header.*?"/, `<a name="header${config.header}"`);
  content = content.replace(/<meta name="dark-mode" content=".*?"/, `<meta name="dark-mode" content="no"`);

  response.type('html').send(content);
});

// Check if Odyssey is running
Request('http://localhost:8000/index.js', (error, response, body) => {
  if (error) {
    console.log(Chalk.red('Oddyssey does not appear to be running at http://localhost:8000/index.js'));
    console.log('\nOdyssey needs to be running in order to test it.');
    return;
  }

  // Something is running but it's not Odyssey
  if (!body.includes(`GLOBAL_NAV: '#abcHeader.global'`)) {
    console.log(Chalk.red("Something was found at http://localhost:8000/index.js but it does't appear to be Odyssey"));
    console.log('\nOdyssey needs to be running in order to test it.');
    return;
  }

  app.listen(3000, () => {
    console.log(Chalk.green('Odyssey found running at http://localhost:8000/index.js'));
    console.log(Chalk.bold('\nServer listening at', Chalk.yellow('http://localhost:3000')));
  });
});
