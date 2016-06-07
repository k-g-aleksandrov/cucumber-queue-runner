'use strict';

var fs = require('fs');

var gherkin = require('gherkin');
var Repository = require('libs/mongoose').Repository;
var Scenario = require('libs/mongoose').Scenario;
var TagExecutionResult = require('libs/mongoose').TagExecutionResult;
var log = require('libs/log')(module);
var util = require('libs/util');

let config = require('config');

var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
  Repository.find({}, function (err, repositories) {
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

router.get('/repositories', (req, res) => {
  Repository.find({}, (err, repositories) => {
    if (err) log.error(err);
    let result = [];
    for (let repo of repositories) {
      result.push(repo.url);
    }
    res.render('repositories', {repositories: result});
  });
});

router.post('/repositories', (req, res) => {
  Repository.remove({}, (err) => {
    if (err) log.error(err);
    if (util.isGitUrl(req.body.repositoryUrl)) {
      var repo = new Repository({
        url: req.body.repositoryUrl
      });
      repo.save(function (err, data) {
        if (err) {
          res.statusCode = 500;
          log.error('Internal error(%d): %s', res.statusCode, err.message);
          return res.send({error: 'Server error'});
        } else {
          log.debug('Saved repository to DB ' + data);
          util.cloneRepository(req.body.repositoryUrl, req.body.repositoryUsername, req.body.repositoryPassword);
          res.redirect('/');
        }
      });
    } else {
      res.redirect('/');
    }
  });
});


function saveScenario(classpath, featureName, scenarioName, scenarioLine, tags, callback) {
  let tagsList = [];
  if (tags) {
    for (let tag of tags) {
      tagsList.push(tag.name);
    }
  }

  var scenario = new Scenario({
    classpath: classpath,
    featureName: featureName,
    scenarioName: scenarioName,
    scenarioLine: scenarioLine,
    tags: tagsList
  });

  scenario.save(callback);
}

router.get('/features', (req, res) => {
  util.scanRepository(config.get('repositoryPath'), (err, results) => {
    if (err) throw err;

    Scenario.remove({}, function (err) {
      if (err)
        log.error(err);
      for (let result of results) {
        var parser = new gherkin.Parser();
        var buf = fs.readFileSync(result, 'utf8');
        var classpath = result.split('src/test/resources/').pop();
        var gherkinDocument = parser.parse(buf);
        var feature = gherkinDocument.feature;
        log.info(`Parsing feature ${feature.name}`);
        for (let child of feature.children) {
          if (child.type === 'ScenarioOutline') {
            var examples = child.examples[0];
            for (let example of examples.tableBody) {
              saveScenario(classpath, feature.name, child.name, example.location.line, child.tags, (err, data) => {
                if (err) {
                  if (err.message.indexOf('duplicate key') > -1) {
                    log.debug('Scenario ' + child.name
                      + ' already exists in DB, skipped');
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
            saveScenario(classpath, feature.name, child.name, child.location.line, child.tags, (err, data) => {
              if (err) {
                if (err.message.indexOf('duplicate key') > -1) {
                  log.debug('Scenario ' + child.name
                    + ' already exists in DB, skipped');
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

router.get('/tags', (req, res) => {
  TagExecutionResult.find({}, (err, tags) => {
    let responseObject = {development: [], daily: [], muted: []};
    for (let tagEntry of tags) {
      if (!tagEntry.tag.startsWith('@id')) continue;
      let nextTag = {tag: tagEntry.tag, executions: [], scenarios: []};
      for (let exec of tagEntry.executions) {
        nextTag.executions.push(exec.result);
      }
      if (!tagEntry.reviewed) {
        responseObject.development.push(nextTag);
      } else if (nextTag.executions[nextTag.executions.length - 1] === 'failed') {
        responseObject.muted.push(nextTag);
      } else {
        responseObject.daily.push(nextTag);
      }
    }
    res.render('tags', responseObject);
  });
});
module.exports = router;
