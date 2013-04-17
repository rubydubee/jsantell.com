/*
 * Updates repo JSON in memory with latest star count
 */

var
  request = require('request'),
  data = require('./repo-data'),
  url = 'https://api.github.com/repos/';

function updateRepoData () {
  Object.keys(data).forEach(function (category) {
    data[category].forEach(function (project) {
      request({ url: url + project.repo, json: true }, function (err, res, body) {
        if (err) return;
        project.name = body.name;
        project.stars = body.watchers;
        project.description = body.description;
      });
    });
  });
}

module.exports = updateRepoData;
