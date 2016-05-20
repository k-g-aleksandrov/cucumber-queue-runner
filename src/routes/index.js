'use strict';

var fs = require('fs');

var gherkin = require('gherkin');
var Repository = require('libs/mongoose').Repository;
var Scenario = require('libs/mongoose').Scenario;
var log = require('libs/log')(module);
var util = require('libs/util');

var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
  Repository.find({}, function(err, repositories) {
    if (err) {
      res.statusCode = 500;
      log.error('Internal error(%d): %s', res.statusCode, err.message);
      return res.send({error: 'Server error'});
    } else {
      if (repositories.length > 0) {
        res.render('index', {repositories: repositories});
      } else {
        res.render('index');
      }
    }
  });
});

router.post('/repositories', (req, res) => {
  if (util.isGitUrl(req.body.repositoryUrl)) {
    var repo = new Repository({
      url: req.body.repositoryUrl,
      username: req.body.repositoryUsername,
      password: req.body.repositoryPassword
    });

    repo.save(function(err, data) {
      if (err) {
        res.statusCode = 500;
        log.error('Internal error(%d): %s', res.statusCode, err.message);
        return res.send({error: 'Server error'});
      } else {
        log.debug('Saved repository to DB ' + data);
        res.redirect('/');
      }
    });
  } else {
    res.redirect('/');
  }
});

router.get('/features', (req, res) => {
  util.scanRepository('/Users/user/.jenkins/jobs/zzz_split_reporter/workspace', (err, results) => {
    if (err) throw err;
    Scenario.remove({}, function(err) {
      if (err)
        log.error(err);
      for (var i = 0; i < results.length; i++) {
        var parser = new gherkin.Parser();
        var buf = fs.readFileSync(results[i], 'utf8');
        var classpath = results[i].split('src/test/resources/')
          .pop();
        var gherkinDocument = parser.parse(buf);
//      console.log(gherkinDocument);
        var feature = gherkinDocument.feature;
        console.log(feature.name);
        var children = feature.children;
        for (var j = 0; j < children.length; j++) {
          var child = children[j];
          if (child.type === 'ScenarioOutline') {
            var examples = child.examples[0];
            for (var k = 0; k < examples.tableBody.length; k++) {
              var tagsList = [];
              if (child.tags) {
                for (var tagI = 0; tagI < child.tags.length; tagI++) {
                  tagsList.push(child.tags[tagI].name);
                }
              }
              var scenario = new Scenario({
                classpath: classpath,
                featureName: feature.name,
                scenarioName: child.name,
                scenarioLine: examples.tableBody[k].location.line,
                tags: tagsList
              });
              scenario.save(function(err, data) {
                if (err) {
                  if (err.message.indexOf('duplicate key') > -1) {
                    log.debug('Scenario ' + child.name + ' already exists in DB, skipped');
                  } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s', res.statusCode, err.message);
                    return res.send({error: 'Server error'});
                  }
                } else {
                  log.debug('Saved scenario to DB ' + data);
                }
              });
            }

          } else {
            var tagsList = [];
            if (child.tags) {
              for (var tagI = 0; tagI < child.tags.length; tagI++) {
                tagsList.push(child.tags[tagI].name);
              }
            }
            var scenario = new Scenario({
              classpath: classpath,
              featureName: feature.name,
              scenarioName: child.name,
              scenarioLine: child.location.line,
              tags: tagsList
            });
            scenario.save(function(err, data) {
              if (err) {
                if (err.message.indexOf('duplicate key') > -1) {
                  log.debug('Scenario ' + child.name + ' already exists in DB, skipped');
                } else {
                  res.statusCode = 500;
                  log.error('Internal error(%d): %s', res.statusCode, err.message);
                  return res.send({error: 'Server error'});
                }
              } else {
                log.debug('Saved scenario to DB ' + data);
              }
            });
          }


        }
      }
      res.send(results);
    });

  });
});

module.exports = router;
