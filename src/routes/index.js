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


function saveScenario(repositoryPath, project, classpath, featureName, scenarioName, scenarioLine, tags, callback) {
  let tagsList = [];
  if (tags) {
    for (let tag of tags) {
      tagsList.push(tag.name);
    }
  }

  var scenario = new Scenario({
    repositoryPath: repositoryPath,
    project: project,
    classpath: classpath,
    featureName: featureName,
    scenarioName: scenarioName,
    scenarioLine: scenarioLine,
    tags: tagsList
  });

  scenario.save(callback);
}

router.get('/features', (req, res) => {
  let repositoryPath = req.query.repository;
  util.scanRepository(repositoryPath, (err, results) => {
    if (err) throw err;

    Scenario.remove({repositoryPath: repositoryPath}, function (err) {
      if (err)
        log.error(err);
      for (let result of results) {
        var parser = new gherkin.Parser();
        var buf = fs.readFileSync(result, 'utf8');
        let parts = result.split('src/test/resources/');
        var classpath = parts.pop();
        var fullProjectPath = parts.pop();
        let project = fullProjectPath.split('/')[fullProjectPath.split('/').length-2];
        var gherkinDocument = parser.parse(buf);
        var feature = gherkinDocument.feature;
        log.info(`Parsing feature ${feature.name}`);
        for (let child of feature.children) {
          if (child.type === 'ScenarioOutline') {
            var examples = child.examples[0];
            for (let example of examples.tableBody) {
              saveScenario(repositoryPath, project, classpath, feature.name, child.name, example.location.line, child.tags, (err, data) => {
                if (err) {
                  if (err.message.indexOf('duplicate key') > -1) {
                    log.debug('Scenario ' + child.name
                      + ' already exists in DB, skipped');
                  } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s', res.statusCode, err.message);
                    return res.send({error: 'Server error'});
                  }
                }
              });
            }
          } else {
            saveScenario(repositoryPath, project, classpath, feature.name, child.name, child.location.line, child.tags, (err, data) => {
              if (err) {
                if (err.message.indexOf('duplicate key') > -1) {
                  log.debug('Scenario ' + child.name
                    + ' already exists in DB, skipped');
                } else {
                  res.statusCode = 500;
                  log.error('Internal error(%d): %s', res.statusCode, err.message);
                  return res.send({error: 'Server error'});
                }
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
    let idTags = [];
    for (let tagEntry of tags) {
      if (!tagEntry.tag.startsWith('@id')) continue;
      idTags.push(tagEntry);
    }
    let promises = idTags.map((idTag) => {
      return new Promise((resolve, reject) => {
        Scenario.find({tags: {$in: [idTag.tag]}}, (err, scenarios) => {
          if (err) { return reject(err); }
          let nextTag = {tag: idTag.tag, executions: [], scenarios: []};
          if (scenarios) {
            for (let sc of scenarios) {
              nextTag.scenarios.push(sc.scenarioName);
            }

          }
          for (let exec of idTag.executions) {
            nextTag.executions.push(exec.result);
          }
          if (!idTag.reviewed) {
            responseObject.development.push(nextTag);
          } else if (nextTag.executions[nextTag.executions.length - 1] === 'failed') {
            responseObject.muted.push(nextTag);
          } else {
            responseObject.daily.push(nextTag);
          }
          resolve();
        });
      });
    });

    Promise.all(promises).then(() => { res.render('tags', responseObject); }).catch(log.error);
  });
});

router.get('/scopes', (req, res) => {
  let project = req.query.project;
  Scenario.find({project: project}, (err, scenarios) => {
    let responseObject = {development: [], daily: [], muted: []};
    if (err) log.error(err);
    let scenarioPromises = scenarios.map((sc) => {
      return new Promise((scResolve, scReject) => {
        let scenarioObject = {};
        let executions = [];
        let idTags = [];
        let scenarioState = null;
        for (let tag of sc.tags) {
          if (tag.startsWith('@id')) {
            idTags.push(tag);
          }
        }
        let tagPromises = idTags.map((idTag) => {
          return new Promise((tagResolve, tagReject) => {
            TagExecutionResult.find({tag: idTag}, (err, result) => {
              if (err) return tagReject(err);
              if (!result || result.length === 0) {
                log.info('Skipped results for tag ' + idTag);
              } else {
                if (!result[0].reviewed) {
                  scenarioState = 'development';
                } else if (result[0].executions[result[0].executions.length - 1].result === 'failed') {
                  if (scenarioState !== 'development') {
                    scenarioState = 'failed';
                  }
                } else {
                  if (scenarioState !== 'development' && scenarioState !== 'failed') {
                    scenarioState = 'passed';
                  }
                }
                let execs = [];
                for (let exec of result[0].executions) {
                  execs.push(exec.result);
                }
                executions.push({tag: idTag, executions: execs});
              }
              tagResolve();
            });
          });
        });
        Promise.all(tagPromises).then(() => {
          if (!sc.scenarioName.trim()) {
            log.warn('Skipping scenario with empty name');
            return scResolve();
          }
          scenarioObject = {scenarioName: sc.scenarioName, tags: executions};
          if (scenarioState === 'development' || scenarioState === null) {
            responseObject.development.push(scenarioObject);
          } else if (scenarioState === 'failed') {
            responseObject.muted.push(scenarioObject);
          } else if (scenarioState === 'passed') {
            responseObject.daily.push(scenarioObject);
          }
          scResolve();
        }).catch(log.error);
      });
    });
    Promise.all(scenarioPromises).then(() => {
      res.render('scopes', responseObject);
    }).catch(log.error);
  });
});

module.exports = router;
