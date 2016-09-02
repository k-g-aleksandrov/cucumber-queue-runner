'use strict';

var Scenario = require('libs/mongoose').Scenario;
var log = require('libs/log')(module);
var util = require('libs/util');
var fs = require('fs');

var TagExecutionResult = require('libs/mongoose').TagExecutionResult;
var Execution = require('libs/mongoose').Execution;

class Session {
  constructor(sessionId, tags, mode, project) {
    this.TIMEOUT_SEC = 1800;
    this.startDate = new Date();
    this.sessionId = sessionId;
    this.inProgressScenarios = {};
    this.doneScenarios = {};
    this.sessionState = Session.NOT_FOUND;
    this.sessionPath = `public/results/${this.sessionId}`;
    this.project = project;

    fs.mkdirSync(this.sessionPath);

    let filter = {project: project, tags: {$in: tags}};
    if (mode === Session.MODE_FAILED) {
      TagExecutionResult.find({}, (err, foundTags) => {
        if (err) throw err;
        let failedTags = [];
        for (let tag of foundTags) {
          if (!tag.tag.startsWith('@id')) continue;
          if (!tag.reviewed) continue;
          let execution = tag.executions[tag.executions.length - 1];
          if (execution.result === 'failed') {
            failedTags.push(tag.tag);
          }
        }
        filter = {project: project, tags: {$in: failedTags}};
        this.startSessionCallback(this.sessionId, filter);
      });
    } else if (mode === Session.MODE_DAILY) {
      log.debug('Daily mode starting');
      TagExecutionResult.find({}, (err, foundTags) => {
        if (err) throw err;
        let passedTags = [];
        for (let tag of foundTags) {
          if (!tag.tag.startsWith('@id')) continue;
          if (!tag.reviewed) {
            log.debug('Tag ' + tag.tag + ' is in development. Skipped');
            continue;
          }
          let execution = tag.executions[tag.executions.length - 1];
          if (execution.result === 'passed') {
            log.debug('Found tag ' + tag.tag + ', adding it to scope');
            passedTags.push(tag.tag);
          }
        }
        filter = {project: project, tags: {$in: passedTags}};
        this.startSessionCallback(this.sessionId, filter);
      });
    } else if (mode === Session.MODE_DEVELOPMENT) {
      TagExecutionResult.find({}, (err, foundTags) => {
        if (err) throw err;
        let noRunTags = [];
        for (let tag of foundTags) {
          if (!tag.tag.startsWith('@id')) continue;
          if (!tag.reviewed) continue;
          noRunTags.push(tag.tag);
        }
        filter = {project: project, tags: {$nin: noRunTags, $in: tags}};
        this.startSessionCallback(this.sessionId, filter);
      });
    } else {
      this.startSessionCallback(this.sessionId, filter);
    }

    this.inProgressTracking = setInterval(() => {
      if (!this.inProgressScenarios) {
        log.debug(sessionId
          + ': There are no in progress scenarios at this moment');
        return;
      }
      var inProgressScenariosIds = Object.keys(this.inProgressScenarios);
      log.debug(sessionId + ': ' + this.getStatistics());
      for (let scenarioId of inProgressScenariosIds) {
        var inProgressScenario = this.inProgressScenarios[scenarioId];
        var requestDate = inProgressScenario.requestTime;
        if ((Date.now() - requestDate) / 1000 > this.TIMEOUT_SEC) {
          log.error(sessionId + ': scenario execution were not finished in '
            + this.TIMEOUT_SEC + ' seconds. Moving it back to scenarios queue');
          this.scenarios.push(inProgressScenario);
          delete this.inProgressScenarios[scenarioId];
        }
      }
    }, 10000);

    this.trackSessionState = setInterval(() => {
      if (this.getScenariosCount(Session.STATE_IN_PROGRESS) +
        this.getScenariosCount(Session.STATE_IN_QUEUE) +
        this.getScenariosCount(Session.STATE_DONE) == 0) {
        clearInterval(this.inProgressTracking);
        fs.writeFileSync(this.sessionPath + '/dummy.txt', '', {});
        util.zipDirectory(this.sessionPath, this.sessionPath + '/reports.zip');
        this.sessionState = Session.NOT_FOUND;
        return;
      }

      if (this.getScenariosCount(Session.STATE_IN_PROGRESS)
        + this.getScenariosCount(Session.STATE_IN_QUEUE) == 0) {
        clearInterval(this.inProgressTracking);

        log.debug(this.sessionId
          + ': Tests execution done. Preparing reports...');

        for (let key of Object.keys(this.doneScenarios)) {
          var combinedReport = null;
          log.info('Processing feature ' + key + ' report');
          var featureReports = this.doneScenarios[key];
          for (let scenario of featureReports) {
            var report = scenario.report[0];
            log.debug('Added report for scenario ' + report.elements[0].keyword
              + ': ' + report.elements[0].name);
            if (!combinedReport) {
              combinedReport = scenario.report;
            } else {
              combinedReport[0].elements = combinedReport[0].elements.concat(report.elements);
            }
          }
          let filename = key.replace(/\W/g, '');
          fs.writeFileSync(this.sessionPath + '/' + filename
            + '.json', JSON.stringify(combinedReport, null, 4));
        }
        util.zipDirectory(this.sessionPath, this.sessionPath + '/reports.zip');
        this.sessionState = Session.NOT_FOUND;
        clearInterval(this.trackSessionState);
      }
    }, 10000);
  }

  startSessionCallback(sessionId, filter) {
    log.info('Started new session ' + sessionId);
    Scenario.find(filter, (err, scenarios) => {
      log.debug(sessionId + ': List of scenarios to be executed: ');
      for (let scenario of scenarios) {
        log.debug(sessionId + ':    ' + scenario.classpath + ':'
          + scenario.scenarioLine);
      }
      log.info(sessionId + ': Number of scenarios to be executed - '
        + scenarios.length);
      this.scenarios = util.shuffleArray(scenarios);
      this.sessionState = Session.OK;
    });
  }

  getSessionId() {
    return this.sessionId;
  }

  getStatistics() {
    return 'In queue - ' + this.getScenariosCount(Session.STATE_IN_QUEUE)
      + ', in progress - ' + this.getScenariosCount(Session.STATE_IN_PROGRESS)
      + ', done - ' + this.getScenariosCount(Session.STATE_DONE);
  }

  getScenariosCount(state) {
    if (Session.STATE_IN_QUEUE === state) {
      if (this.scenarios) {
        return this.scenarios.length;
      } else {
        return 0;
      }
    } else if (Session.STATE_IN_PROGRESS === state) {
      return Object.keys(this.inProgressScenarios).length;
    } else if (Session.STATE_DONE === state) {
      var doneCount = 0;
      for (let doneFeature of Object.keys(this.doneScenarios)) {
        doneCount += this.doneScenarios[doneFeature].length;
      }
      return doneCount;
    } else if (Session.STATE_PASSED === state) {
      var passedCount = 0;
      for (let doneFeature of Object.keys(this.doneScenarios)) {
        for (let scenario of this.doneScenarios[doneFeature]) {
          if ('passed' === scenario.result) {
            passedCount++;
          }
        }
      }
      return passedCount;
    } else if (Session.STATE_FAILED === state) {
      var failedCount = 0;
      for (let doneFeature of Object.keys(this.doneScenarios)) {
        for (let scenario of this.doneScenarios[doneFeature]) {
          if ('failed' === scenario.result || 'undefined' === scenario.result) {
            failedCount++;
          }
        }
      }
      return failedCount;
    } else {
      return this.getScenariosCount(Session.STATE_IN_QUEUE)
        + this.getScenariosCount(Session.STATE_IN_PROGRESS)
        + this.getScenariosCount(Session.STATE_DONE);
    }
  }

  getNextScenario(executor) {
    var next = this.scenarios.shift();
    if (next) {
      next.startTimestamp = Date.now();
      next.executor = executor;
      this.inProgressScenarios[next._id] = next;
    }
    return next;
  }

  getScenarioState(report) {
    let result = 'passed';
    for (let reportEntry of report) {
      for (let element of reportEntry.elements) {
        for (let step of element.steps) {
          if (step.result.status === 'failed') {
            result = 'failed';
            break;
          } else if (step.result.status === 'undefined') {
            result = 'undefined';
          } else if (step.result.status === 'skipped' && result === 'passed') {
            result = 'skipped';
          }
        }
      }
    }
    return result;
  }

  writeTagsExecutionResultToDb(scenarioTags, result) {
    for (let tag of scenarioTags) {
      TagExecutionResult.update(
        {tag: tag},
        {
          $push: {
            'executions': {
              $each: [{result: result}],
              $slice: -10
            }
          }
        },
        {safe: true, upsert: true},
        (err) => {
          if (err) throw err;
          log.info('Successfully added execution for tag ' + tag);
          this.updateTagDevelopmentStatus(tag);
        }
      );
    }
  }

  storeExecutionResult(scenario) {
    Execution.update(
      {scenarioId: scenario.getScenarioId()},
      {
        $push: {
          'executions': {
            $each: [{startTimestamp: scenario.startTimestamp, result: scenario.result, executor: scenario.executor}],
            $slice: -100
          }
        }
      },
      {safe: true, upsert: true},
      (err) => {
        if (err) throw err;
        log.info('Successfully stored execution result for scenario ' + scenario.scenarioId);
      }
    );
  }

  updateTagDevelopmentStatus(tag) {
    log.debug('Checking current state for tag ' + tag);
    TagExecutionResult.find({tag: tag}, (err, tags) => {
      for (let t of tags) {
        if (t.reviewed) continue;
        let maxPassedSequence = 0;
        let currentPassedSequence = 0;
        for (let execution of t.executions) {
          if (execution.result === 'passed') {
            currentPassedSequence++;
          } else {
            maxPassedSequence = (maxPassedSequence < currentPassedSequence) ? currentPassedSequence : maxPassedSequence;
            currentPassedSequence = 0;
          }
        }
        maxPassedSequence = (maxPassedSequence < currentPassedSequence) ? currentPassedSequence : maxPassedSequence;
        if (maxPassedSequence >= 5) {
          log.debug('Updating tag state to reviewed ' + tag);
          TagExecutionResult.update(
            {tag: tag},
            {$set: {reviewed: true}},
            {upsert: true},
            (err) => {
              if (err) throw err;
            }
          );
        } else {
          log.debug('Tag still in development mode ' + tag);
        }
      }
    });
  }

  saveScenarioResult(scenarioId, scenarioReport, cb) {
    log.debug('Saving scenario ' + scenarioId + ' result');
    if (this.inProgressScenarios[scenarioId] == null) {
      cb(new Error('Can\'t find in progress scenario for ID ' + scenarioId));
    } else {
      let featureName = this.inProgressScenarios[scenarioId].featureName;
      if (!this.doneScenarios[featureName]) {
        this.doneScenarios[featureName] = [];
      }
      var sc = this.inProgressScenarios[scenarioId];
      sc.report = scenarioReport;
      sc.result = this.getScenarioState(scenarioReport);
      if (sc.result !== 'skipped') {
        this.writeTagsExecutionResultToDb(sc.tags, sc.result);
        this.storeExecutionResult(sc);
      }
      this.doneScenarios[featureName].push(this.inProgressScenarios[scenarioId]);
      delete this.inProgressScenarios[scenarioId];
      cb();
    }
  }

  getSessionState() {
    return this.sessionState;
  }

  getStatus() {
    var status = {queue: [], inProgress: [], done: {}, passed: [], failed: []};
    for (let queueScenario of this.scenarios) {
      status.queue.push({
        scenarioId: queueScenario._id,
        classpath: queueScenario.classpath,
        featureName: queueScenario.featureName,
        scenarioLine: queueScenario.scenarioLine,
        scenarioName: queueScenario.scenarioName
      });
    }

    for (let inProgressScenarioId of Object.keys(this.inProgressScenarios)) {
      let inProgressScenario = this.inProgressScenarios[inProgressScenarioId];
      status.inProgress.push({
        scenarioId: inProgressScenario._id,
        classpath: inProgressScenario.classpath,
        featureName: inProgressScenario.featureName,
        scenarioLine: inProgressScenario.scenarioLine,
        scenarioName: inProgressScenario.scenarioName
      });
    }

    for (let featureKey of Object.keys(this.doneScenarios)) {
      let feature = this.doneScenarios[featureKey];
      for (let scenario of feature) {
        if (!status.done[featureKey]) {
          status.done[featureKey] = [];
        }
        status.done[featureKey].push({
          scenarioId: scenario._id,
          classpath: scenario.classpath,
          scenarioLine: scenario.scenarioLine,
          scenarioName: scenario.scenarioName,
          result: scenario.result
        });
        if (scenario.result === 'failed') {
          status.failed.push({
            scenarioId: scenario._id,
            classpath: scenario.classpath,
            scenarioLine: scenario.scenarioLine,
            scenarioName: scenario.scenarioName,
            result: scenario.result
          });
        } else {
          status.passed.push({
            scenarioId: scenario._id,
            classpath: scenario.classpath,
            scenarioLine: scenario.scenarioLine,
            scenarioName: scenario.scenarioName,
            result: scenario.result
          });
        }
      }
    }
    return status;
  }
}

Session.STATE_IN_QUEUE = 'in queue';
Session.STATE_IN_PROGRESS = 'in progress';
Session.STATE_DONE = 'done';
Session.STATE_PASSED = 'passed';
Session.STATE_FAILED = 'failed';

Session.OK = 'OK';
Session.NOT_FOUND = 'NOT_FOUND';
Session.IN_PROGRESS = 'IN_PROGRESS';
Session.FINALIZATION = 'FINALIZATION';

Session.MODE_FULL_RUN = 'full';
Session.MODE_DEVELOPMENT = 'dev';
Session.MODE_FAILED = 'failed';
Session.MODE_DAILY = 'daily';

module.exports = Session;
