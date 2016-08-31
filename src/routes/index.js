'use strict';

var Scenario = require('libs/mongoose').Scenario;
var TagExecutionResult = require('libs/mongoose').TagExecutionResult;
var log = require('libs/log')(module);

var express = require('express');
var router = express.Router();

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
          if (err) {
            return reject(err);
          }
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

    Promise.all(promises).then(() => {
      res.render('tags', responseObject);
    }).catch(log.error);
  });
});

router.get('/*', (req, res) => {
  res.redirect('/sessions/list');
});

module.exports = router;
