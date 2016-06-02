'use strict';

var Scenario = require('libs/mongoose').Scenario;
var log = require('libs/log')(module);
var util = require('libs/util');
var fs = require('fs');

class Session {
  constructor(sessionId, tags) {
    this.TIMEOUT_SEC = 600;
    this.sessionId = sessionId;
    this.inProgressScenarios = {};
    this.doneScenarios = {};
    this.sessionState = Session.NOT_FOUND;
    this.sessionPath = `public/results/${this.sessionId}`;

    fs.mkdirSync(this.sessionPath);

    log.info('Started new session ' + sessionId);
    Scenario.find({tags: {$in: tags}}, (err, scenarios) => {
      log.debug(sessionId + ': List of scenarios to be executed: ');
      for (let scenario of scenarios) {
        log.debug(sessionId + ':    ' + scenario.classpath + ':'
          + scenario.scenarioLine);
      }
      log.info(sessionId + ': Number of scenarios to be executed - '
        + scenarios.length);
      this.scenarios = scenarios;
      this.sessionState = Session.OK;
    });

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
      return this.scenarios.length;
    } else if (Session.STATE_IN_PROGRESS === state) {
      return Object.keys(this.inProgressScenarios).length;
    } else if (Session.STATE_DONE === state) {
      var doneCount = 0;
      for (let doneFeature of Object.keys(this.doneScenarios)) {
        doneCount += this.doneScenarios[doneFeature].length;
      }
      return doneCount;
    } else {
      return this.getScenariosCount(Session.STATE_IN_QUEUE)
        + this.getScenariosCount(Session.STATE_IN_PROGRESS)
        + this.getScenariosCount(Session.STATE_DONE);
    }
  }

  getNextScenario() {
    var next = this.scenarios.shift();
    if (next) {
      next.requestTime = Date.now();
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
          }
        }
      }
    }
    return result;
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
      this.doneScenarios[featureName].push(this.inProgressScenarios[scenarioId]);
      delete this.inProgressScenarios[scenarioId];
      cb();
    }
  }

  getSessionState() {
    return this.sessionState;
  }

  getStatus() {
    var status = {queue: [], inProgress: [], done: []};
    for (let queueScenario of this.scenarios) {
      status.queue.push(`${queueScenario.classpath}:${queueScenario.scenarioLine} (${queueScenario.scenarioName})`);
    }

    for (let inProgressScenarioId of Object.keys(this.inProgressScenarios)) {
      let inProgressScenario = this.inProgressScenarios[inProgressScenarioId];
      status.inProgress.push(`${inProgressScenario.classpath}:${inProgressScenario.scenarioLine} (${inProgressScenario.scenarioName})`);
    }

    for (let doneScenarioId of Object.keys(this.doneScenarios)) {
      let feature = this.doneScenarios[doneScenarioId];
      for (let scenario of feature) {
        status.done.push(`${scenario.classpath}:${scenario.scenarioLine} (${scenario.scenarioName})<br/>${scenario.result}`);
      }
    }
    return status;
  }
}

Session.STATE_IN_QUEUE = 'in queue';
Session.STATE_IN_PROGRESS = 'in progress';
Session.STATE_DONE = 'done';

Session.OK = 'OK';
Session.NOT_FOUND = 'NOT_FOUND';
Session.IN_PROGRESS = 'IN_PROGRESS';
Session.FINALIZATION = 'FINALIZATION';

module.exports = Session;
