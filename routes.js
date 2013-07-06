var repoData = require('./lib/repo-data');
var html2text = require('html-to-text');

module.exports = function (app) {

  app.get('/', function (req, res) {
    res.render('index', {
      title: 'Jordan Santell'
    });
  });

  app.get('/projects', function (req, res) {
    res.render('projects', {
      title: 'Projects * Jordan Santell',
      repos: repoData
    });
  });

  app.get('/tags', function (req, res) {
    res.render('tags', {
      title: 'Tags * Jordan Santell'
    });
  });

  app.get('/categories', function (req, res) {
    res.render('categories', {
      title: 'Categories * Jordan Santell'
    });
  });

  app.get('/rss', function (req, res) {
    var posts = app.locals.getPosts(0, 5);
    res.setHeader('Content-Type', 'application/rss+xml');
    res.render('rss', { posts: posts });
  });
};
