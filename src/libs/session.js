const log = require('libs/log')(module);

import util from 'libs/util';
import fs from 'fs';
import { Scenario, Execution } from 'libs/mongoose';

import filter from 'libs/filter';

class Session {
  constructor(sessionId, tags, scope, project) {
    this.TIMEOUT_SEC = 1800;
    this.startDate = new Date();
    this.sessionId = sessionId;
    this.inProgressScenarios = {};
    this.doneScenarios = {};
    this.sessionState = Session.NOT_FOUND;
    this.sessionPath = `public/results/${this.sessionId}`;
    this.project = project;
    this.scope = scope;
    this.tags = tags;

    fs.mkdirSync(this.sessionPath);

    if (!filter.getFilterByName(scope)) {
      throw Error(`Can\'t find filter with name ${scope}`);
    }
    if (scope === 'custom') {
      if (!tags) {
        throw Error('You should specify tags to filter scenarios if you use custom filter.');
      }
      filter.applyCustomFilterToProject(project, tags, (err, project, scenarios) => {
        this.startSessionCallback(err, scenarios);
      });
    } else {
      filter.applyFilterToProject(project, filter.getFilterByName(scope), (err, project, scenarios) => {
        this.startSessionCallback(err, scenarios);
      });
    }

    this.trackInProgressTimeout = setInterval(() => {
      Session.trackInProgressTimeoutFunc(this);
    }, 10000);

    this.trackSessionState = setInterval(() => {
      Session.trackSessionStateFunc(this);
    }, 10000);
  }

  startSessionCallback(err, scenarios) {
    if (err) {
      log.error(err);
    }
    this.scenarios = util.shuffleArray(scenarios);
    this.sessionState = Session.OK;
  }

  getSessionId() {
    return this.sessionId;
  }

  getSessionDetails() {
    return {
      sessionId: this.sessionId,
      startDate: this.startDate,
      project: this.project,
      scope: this.scope,
      tags: this.tags
    };
  }

  getBriefStatus() {
    return {
      sessionId: this.sessionId,
      startDate: this.startDate,
      project: this.project,
      scope: this.scope,
      tags: this.tags,
      queueCount: this.getScenariosCount('in queue'),
      progressCount: this.getScenariosCount('in progress'),
      passedCount: this.getScenariosCount('passed'),
      failedCount: this.getScenariosCount('failed'),
      skippedCount: this.getScenariosCount('skipped'),
      doneCount: this.getScenariosCount('done'),
      totalCount: this.getScenariosCount()
    };
  }

  getStatistics() {
    return 'In queue - ' + this.getScenariosCount(Session.STATE_IN_QUEUE)
      + ', in progress - ' + this.getScenariosCount(Session.STATE_IN_PROGRESS)
      + ', done - ' + this.getScenariosCount(Session.STATE_DONE);
  }

  getDoneScenariosCount(countFilter) {
    let resultCount = 0;

    for (const doneFeature of Object.keys(this.doneScenarios)) {
      if (countFilter) {
        for (const scenario of this.doneScenarios[doneFeature]) {
          if (countFilter.indexOf(scenario.result) > -1) {
            resultCount++;
          }
        }
      } else {
        resultCount += this.doneScenarios[doneFeature].length;
      }
    }
    return resultCount;
  }

  getScenariosCount(state) {
    if (!state) {
      return this.getScenariosCount(Session.STATE_IN_QUEUE)
        + this.getScenariosCount(Session.STATE_IN_PROGRESS)
        + this.getScenariosCount(Session.STATE_DONE);
    }
    switch (state) {
      case Session.STATE_IN_QUEUE:
        return this.scenarios ? this.scenarios.length : 0;
      case Session.STATE_IN_PROGRESS:
        return Object.keys(this.inProgressScenarios).length;
      case Session.STATE_DONE:
        return this.getDoneScenariosCount();
      case Session.STATE_PASSED:
        return this.getDoneScenariosCount([
          'passed'
        ]);
      case Session.STATE_FAILED:
        return this.getDoneScenariosCount([
          'failed'
        ]);
      case Session.STATE_SKIPPED:
        return this.getDoneScenariosCount(['skipped', 'undefined']);
      default:
        throw Error(`There is no such state - ${state}`);
    }
  }

  getNextScenario(executor) {
    const next = this.scenarios.shift();

    if (next) {
      next.startTimestamp = Date.now();
      next.executor = executor;
      this.inProgressScenarios[next._id] = next;
    }
    return next;
  }

  pushScenarioToDone(scenario) {
    if (!this.doneScenarios[scenario.featureName]) {
      this.doneScenarios[scenario.featureName] = [];
    }
    this.doneScenarios[scenario.featureName].push(scenario);
  }

  skipScenario(scenarioId) {
    for (let i = 0; i < this.scenarios.length; i++) {
      if (this.scenarios[i]._id.toString() === scenarioId) {
        this.scenarios[i].result = 'skipped';
        this.pushScenarioToDone(this.scenarios[i]);
        this.scenarios.splice(i, 1);
      }
    }
  }

  stopSession() {
    this.scenarios = [];
    this.inProgressScenarios = {};
  }

  storeExecutionResult(scenario) {
    Execution.update(
      { scenarioId: scenario.getScenarioId() },
      {
        $push: {
          'executions': {
            $each: [
              { startTimestamp: scenario.startTimestamp, result: scenario.result, executor: scenario.executor }
            ],
            $slice: -100
          }
        }
      },
      { safe: true, upsert: true },
      (err) => {
        if (err) throw err;
        log.info(`Successfully stored execution result for scenario ${scenario.getScenarioId()}`);
      }
    );
  }

  saveScenarioResult(scenarioId, scenarioReport, cb) {
    log.debug(`Saving scenario ${scenarioId} result`);
    if (this.inProgressScenarios[scenarioId] === null) {
      return cb(new Error(`Can\'t find in progress scenario for ID ${scenarioId}`));
    }
    const featureName = this.inProgressScenarios[scenarioId].featureName;

    if (!this.doneScenarios[featureName]) {
      this.doneScenarios[featureName] = [];
    }
    const sc = this.inProgressScenarios[scenarioId];

    sc.report = scenarioReport;
    sc.result = Session.getScenarioState(scenarioReport);
    if (sc.result !== 'skipped') {
      this.storeExecutionResult(sc);
    }
    for (let i = 0; i < sc.report.length; i++) {
      const elements = sc.report[i].elements;

      if (elements) {
        for (let j = 0; j < elements.length; j++) {
          const tags = elements[j].tags;

          if (tags) {
            const newTag = JSON.parse(JSON.stringify(tags[0]));

            newTag.name = `@${sc.executor}`;
            tags.push(newTag);
          }
        }
      }
    }
    this.doneScenarios[featureName].push(this.inProgressScenarios[scenarioId]);
    delete this.inProgressScenarios[scenarioId];
    return cb();
  }

  getSessionState() {
    return this.sessionState;
  }

  getStatus() {
    const status = { queue: [], inProgress: [], done: {}, passed: [], failed: [], skipped: [] };

    for (const queueScenario of this.scenarios) {
      status.queue.push({
        scenarioId: queueScenario._id,
        classpath: queueScenario.classpath,
        featureName: queueScenario.featureName,
        scenarioLine: queueScenario.scenarioLine,
        scenarioName: queueScenario.scenarioName
      });
    }

    for (const inProgressScenarioId of Object.keys(this.inProgressScenarios)) {
      const inProgressScenario = this.inProgressScenarios[inProgressScenarioId];

      status.inProgress.push({
        scenarioId: inProgressScenario._id,
        classpath: inProgressScenario.classpath,
        featureName: inProgressScenario.featureName,
        scenarioLine: inProgressScenario.scenarioLine,
        scenarioName: inProgressScenario.scenarioName,
        executor: inProgressScenario.executor
      });
    }

    for (const featureKey of Object.keys(this.doneScenarios)) {
      const feature = this.doneScenarios[featureKey];

      for (const scenario of feature) {
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
        Session.pushScenarioToStatusList(status, scenario);
      }
    }
    return status;
  }
}

Session.pushScenarioToStatusList = function pushScenarioToStatusList(resultObject, scenario) {
  resultObject[scenario.result].push({
    scenarioId: scenario._id,
    classpath: scenario.classpath,
    scenarioLine: scenario.scenarioLine,
    scenarioName: scenario.scenarioName,
    result: scenario.result
  });
};

Session.getScenarioState = function getScenarioState(report) {
  let result = 'passed';

  for (const reportEntry of report) {
    for (const element of reportEntry.elements) {
      if (element.before) {
        for (const before of element.before) {
          if (before.result.status === 'failed') {
            result = 'failed';
            break;
          }
        }
      }
      for (const step of element.steps) {
        if (step.result.status === 'failed') {
          result = 'failed';
          break;
        } else if (step.result.status === 'undefined') {
          result = 'failed';
        } else if (step.result.status === 'skipped' && result === 'passed') {
          result = 'skipped';
        }
      }
    }
  }
  return result;
};

Session.trackSessionStateFunc = function trackSessionStateFunc(session) {
  if (session.getScenariosCount(Session.STATE_IN_PROGRESS)
    + session.getScenariosCount(Session.STATE_IN_QUEUE) === 0) {
    clearInterval(session.trackInProgressTimeout);
    log.debug(`${session.sessionId}: Tests execution done`);
    let haveReports = false;

    if (session.getScenariosCount(Session.STATE_DONE) > 0) {
      log.debug(`${session.sessionId}: Tests execution done. Preparing reports...`);
      for (const key of Object.keys(session.doneScenarios)) {
        let combinedReport = null;

        log.info(`Processing feature ${key} report`);
        const featureReports = session.doneScenarios[key];

        for (const scenario of featureReports) {
          if (!scenario.report) {
            log.debug(`No report for scenario ${scenario.getScenarioId()} saved`);
            continue;
          }
          const report = scenario.report[0];

          if (report) {
            log.debug(`Added report for scenario ${report.elements[0].keyword}: ${report.elements[0].name}`);
            if (!combinedReport) {
              combinedReport = scenario.report;
            } else {
              combinedReport[0].elements = combinedReport[0].elements.concat(report.elements);
            }
          } else {
            log.debug(`Report for scenario ${scenario.getScenarioId()} was not sent correctly`);
          }
        }
        const filename = key.replace(/\W/g, '');

        if (combinedReport) {
          fs.writeFileSync(`${session.sessionPath}/${filename}.json`, JSON.stringify(combinedReport, null, 4));
          haveReports = true;
        }
      }
    }

    if (!haveReports) {
      fs.writeFileSync(`${session.sessionPath}/dummy.txt`, '', {});
    }
    util.zipDirectory(session.sessionPath, `${session.sessionPath}/reports.zip`);
    clearInterval(session.trackSessionState);
    session.sessionState = Session.NOT_FOUND;
    log.debug(`${session.sessionId}: Session stopped`);
  }
};

Session.trackInProgressTimeoutFunc = function trackInProgressTimeoutFunc(session) {
  if (!session.inProgressScenarios) {
    log.debug(`${session.sessionId}: There are no in progress scenarios at this moment`);
    return;
  }
  const inProgressScenariosIds = Object.keys(session.inProgressScenarios);

  log.debug(`${session.sessionId}: ${session.getStatistics()}`);
  for (const scenarioId of inProgressScenariosIds) {
    const inProgressScenario = session.inProgressScenarios[scenarioId];
    const requestDate = inProgressScenario.startTimestamp;

    if ((Date.now() - requestDate) / 1000 > session.TIMEOUT_SEC) {
      log.error(
        `${session.sessionId}: scenario execution were not finished in ${session.TIMEOUT_SEC} seconds.
         Moving it back to scenarios queue`);
      session.scenarios.push(inProgressScenario);
      delete session.inProgressScenarios[scenarioId];
    }
  }
};

Session.sessions = {};

Session.STATE_IN_QUEUE = 'in queue';
Session.STATE_IN_PROGRESS = 'in progress';
Session.STATE_DONE = 'done';
Session.STATE_PASSED = 'passed';
Session.STATE_FAILED = 'failed';
Session.STATE_SKIPPED = 'skipped';

Session.OK = 'OK';
Session.NOT_FOUND = 'NOT_FOUND';
Session.IN_PROGRESS = 'IN_PROGRESS';
Session.FINALIZATION = 'FINALIZATION';

module.exports = Session;
