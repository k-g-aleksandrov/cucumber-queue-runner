'use strict';

var fs = require('fs');
var log = require('libs/log')(module);
var Repository = require('libs/mongoose').Repository;
var gh = require('parse-github-url');
var Git = require('nodegit');

module.exports.isGitUrl = function isGitUrl(str) {
  var re = /(?:git|ssh|https?|git@[\w\.]+):(?:\/\/)?[\w\.@:\/~_-]+\.git(?:\/?|\#[\d\w\.\-_]+?)$/;
  return re.test(str);
};

module.exports.generateGUID = function generateGUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4()
    + s4();
};

module.exports.cloneRepository = function cloneRepository(repositoryUrl) {
  Repository.find({url: repositoryUrl}, (err, repositories) => {
    for (let repo of repositories) {
      Git.Clone(repo.url, 'public/repositories/' + gh(repo.url).name)
        .catch( (err) => { log.error(err); } );
    }
  });
}

module.exports.scanRepository = function scanRepository(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          scanRepository(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          if (file.indexOf('src') > -1 && file.endsWith('.feature')) {
            log.debug(file);
            results.push(file);
          }
          next();
        }
      });
    })();
  });
};
module.exports.removeDirectory = function(dirPath, removeSelf) {
  if (removeSelf === undefined)
    removeSelf = true;
  try {
    var files = fs.readdirSync(dirPath);
  }
  catch (e) {
    return;
  }
  if (files.length > 0)
    for (var i = 0; i < files.length; i++) {
      var filePath = dirPath + '/' + files[i];
      if (fs.statSync(filePath)
          .isFile())
        fs.unlinkSync(filePath);
      else
        this.removeDirectory(filePath);
    }
  if (removeSelf)
    fs.rmdirSync(dirPath);
};

module.exports.zipDirectory = function(dir, name) {
  var execFileSync = require('child_process').execFileSync;

  execFileSync('zip', ['-r', '-j', name, dir]);
};