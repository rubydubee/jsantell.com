var
  express = require('express'),
  app = express(),
  Poet = require('poet'),
  schedule = require('node-schedule'),
  handle404 = require('./lib/handle-404'),
  updateRepoData = require('./lib/update-repo-data');

var poet = Poet(app, {
  postsPerPage: 5,
  posts: __dirname + '/_posts',
  metaFormat: 'json',
});

poet
  .watch()
  .init();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.use(app.router);
app.use(handle404);

app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
  app.use(express.errorHandler());
});

require('./routes')(app);

// Get repository data
if (process.env.NODE_ENV === 'production') {
  schedule.scheduleJob('0 * * * *', updateRepoData);
  updateRepoData();
}

app.listen(3333);
