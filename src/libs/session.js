import logTemplate from 'libs/log';
const log = logTemplate(module);

import util from 'libs/util';
import fs from 'fs';
import { Execution, SessionHistory, Scenario, HistoryScenario, HistoryTag, HistoryFeature } from 'libs/mongoose';

import filter from 'libs/filter';

class Session {
  constructor(sessionId, project, scenariosFilter, iterations) {
    this.sessionId = sessionId;
    this.project = project;
    this.scenariosFilter = scenariosFilter;

    this.startDate = new Date();
    this.inProgressScenarios = {};
    this.doneScenarios = {};
    this.sessionState = Session.NOT_FOUND;
    this.sessionPath = `public/results/${this.sessionId}`;

    this.iterations = iterations;

    this.makeSessionDirectory()
      .then(() => {
        if (!filter.hasFilter(scenariosFilter.scope)) {
          throw Error(`Can\'t find filter with name ${scenariosFilter.scope}`);
        }
        if (scenariosFilter.scope === 'custom') {
          if (!scenariosFilter.tags) {
            throw Error('\'tags\' parameter should be specified for custom filter.');
          }
          filter.applyCustomFilterToProject(project, scenariosFilter.tags, (err, prj, scenarios) => {
            this.finalizeSessionInit(err, scenarios, iterations);
          });
        } else {
          Scenario.find({
            project,
            filters: {
              $in: [
                filter.getFilterByName(scenariosFilter.scope).id
              ]
            }
          }).exec()
            .then((scenarios) => {
              this.finalizeSessionInit(null, scenarios, iterations);
              return new SessionHistory({
                sessionId, details: {}, briefStatus: {}, features: [], tags: [], failures: [], scenarios: []
              }).save()
              .then(() => {
                log.debug(`successfully prepared session history object for session ${sessionId}`);
              })
              .catch((err) => {
                log.error(err);
              });
            })
            .catch((err) => {
              log.error(err);
            });
        }
      });
  }

  makeSessionDirectory() {
    return new Promise((resolve) => {
      fs.mkdir(this.sessionPath, () => {
        resolve();
      });
    });
  }
  finalizeSessionInit(err, scenarios, iterations) {
    if (err) {
      this.sessionState = Session.STATE_ERROR;
      return;
    }
    let scenariosArray = [];

    for (let i = 0; i < iterations; i++) {
      scenariosArray = scenariosArray.concat(scenarios);
    }
    this.startSessionCallback(err, scenariosArray, iterations)
      .then(() => {
        this.trackInProgressTimeout = setInterval(() => {
          Session.trackInProgressTimeoutFunc(this);
        }, 10000);

        this.trackSessionState = setInterval(() => {
          Session.trackSessionStateFunc(this);
        }, 10000);
      })
      .catch((error) => {
        throw error;
      });
  }

  startSessionCallback(err, scenarios) {
    return new Promise((resolve, reject) => {
      if (err) {
        log.error(err);
        reject();
      }

      this.scenarios = util.shuffleArray(scenarios);
      this.sessionState = Session.OK;
      resolve();
    });
  }

  getSessionId() {
    return this.sessionId;
  }

  getSessionDetails() {
    return {
      sessionId: this.sessionId,
      startDate: this.startDate,
      project: this.project,
      scenariosFilter: this.scenariosFilter,
      jenkinsLink: this.jenkinsLink
    };
  }

  getBriefStatus() {
    return {
      queueCount: this.getScenariosCount(Session.STATE_QUEUE),
      progressCount: this.getScenariosCount(Session.STATE_IN_PROGRESS),
      doneCount: this.getScenariosCount(Session.STATE_DONE),
      passedCount: this.getScenariosCount(Session.STATE_PASSED),
      failedCount: this.getScenariosCount(Session.STATE_FAILED),
      skippedCount: this.getScenariosCount(Session.STATE_SKIPPED),
      totalCount: this.getScenariosCount()
    };
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
      return this.getScenariosCount(Session.STATE_QUEUE)
        + this.getScenariosCount(Session.STATE_IN_PROGRESS)
        + this.getScenariosCount(Session.STATE_DONE);
    }
    switch (state) {
      case Session.STATE_QUEUE:
        return this.scenarios ? this.scenarios.length : 0;
      case Session.STATE_IN_PROGRESS:
        return Object.keys(this.inProgressScenarios).length;
      case Session.STATE_DONE:
        return this.getDoneScenariosCount();
      case Session.STATE_PASSED:
        return this.getDoneScenariosCount([ 'passed' ]);
      case Session.STATE_FAILED:
        return this.getDoneScenariosCount([ 'failed' ]);
      case Session.STATE_SKIPPED:
        return this.getDoneScenariosCount(['skipped', 'undefined']);
      default:
        throw Error(`There is no such state - ${state}`);
    }
  }

  updateScenarioRuntimeReport(scenarioId, payload) {
    const scenario = this.inProgressScenarios[scenarioId];

    if (payload.executor) {
      scenario.executor = payload.executor;
    }

    const reportInstance = scenario.report[0];

    if (!reportInstance.elements) {
      reportInstance.elements = [];
    }
    if (!reportInstance.elements[0]) {
      reportInstance.elements.push({ before: [], steps: [], after: [] });
    }

    const reportElementsInstance = reportInstance.elements[0];

    let lastStep;

    switch (payload.type) {
      case 'before':
        reportElementsInstance.before.push(payload.report);
        break;
      case 'step':
        lastStep = reportElementsInstance.steps[reportElementsInstance.steps.length - 1];

        if (lastStep && reportElementsInstance.steps[reportElementsInstance.steps.length - 1].name === payload.report.name) {
          reportElementsInstance.steps[reportElementsInstance.steps.length - 1] = payload.report;
        } else {
          reportElementsInstance.steps.push(payload.report);
        }
        break;
      case 'after':
        reportElementsInstance.after.push(payload.report);
        break;
      default:
        console.log(`unknown type ${payload.type}`);
    }
  }

  getScenarioRuntimeReport(scenarioId) {
    return this.inProgressScenarios[scenarioId].report;
  }

  getNextScenario(executor) {
    const next = this.scenarios.shift();

    if (next) {
      next.startTimestamp = Date.now();
      next.executor = executor;
      next.report = [ { elements: [ { before: [], steps: [], after: [] } ] } ];
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
      }
    );
  }

  storeScenarioExecutionResult(scenario) {
    scenario.executions.push({
      startTimeStamp: scenario.startTimestamp,
      result: scenario.result,
      executor: scenario.executor
    });
    scenario.executions = scenario.executions.slice(-100);
    scenario.filters = filter.getScenarioFilters(scenario);
    Scenario.update(
      { _id: scenario._id },
      {
        executions: scenario.executions,
        filters: scenario.filters
      },
      { safe: true, upsert: true }).exec()
      .then(() => {
      })
      .catch((err) => {
        throw err;
      });
  }

  saveScenarioResult(scenarioId, scenarioReport, cb) {
    if (!this.inProgressScenarios[scenarioId]) {
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
      this.storeScenarioExecutionResult(sc);
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
    const historyScenario = new HistoryScenario({
      scenario: {
        scenarioId: sc._id,
        classpath: sc.classpath,
        scenarioLine: sc.scenarioLine,
        scenarioName: sc.scenarioName,
        featureName: sc.featureName,
        result: sc.result,
        report: sc.report,
        executor: sc.executor
      }
    });

    historyScenario.save()
      .then((savedScenario) => {
        const pushObject = { scenarios: savedScenario._id };

        if (sc.result === 'failed') {
          pushObject.failures = savedScenario._id;
        }

        SessionHistory.update({ sessionId: this.sessionId }, { $push: pushObject }).exec();

        const increment = {
          passedScenarios: sc.result === 'passed' ? 1 : 0,
          failedScenarios: sc.result === 'failed' ? 1 : 0,
          skippedScenarios: sc.result === 'skipped' ? 1 : 0,
          unstableScenarios: 1,
          passedSteps: 1,
          failedSteps: 1,
          skippedSteps: 1,
          pendingSteps: 1,
          undefinedSteps: 1
        };

        this.pushHistoryFeature(sc.featureName, savedScenario._id, increment);
        this.pushHistoryTags(sc.report, savedScenario._id);
      })
      .catch((saveHistoryScenarioErr) => {
        log.error(saveHistoryScenarioErr);
      });
    delete this.inProgressScenarios[scenarioId];
    return cb();
  }

  pushHistoryFeature(featureName, savedScenarioId, increment) {
    HistoryFeature.findOneAndUpdate(
        { sessionId: this.sessionId, name: featureName },
        { sessionId: this.sessionId, name: featureName, $push: { scenarios: savedScenarioId }, $inc: increment },
        { upsert: true, new: true }
      ).exec().then((historyTag) => {
        return SessionHistory.findOneAndUpdate(
          { sessionId: this.sessionId },
          { $addToSet: { features: historyTag._id } }
        ).exec();
      }).catch((err) => {
        log.info(err);
      });
  }

  pushHistoryTags(scenarioReport, savedScenarioId) {
    const allTags = [];

    for (let i = 0; i < scenarioReport.length; i++) {
      const elements = scenarioReport[i].elements;

      if (elements) {
        for (let j = 0; j < elements.length; j++) {
          if (elements[j].tags) {
            allTags.push(...elements[j].tags);
          }
        }
      }
    }

    for (const tag of allTags) {
      HistoryTag.findOneAndUpdate(
        { sessionId: this.sessionId, name: tag.name },
        { sessionId: this.sessionId, name: tag.name, $push: { scenarios: savedScenarioId } },
        { upsert: true, new: true }
      ).exec().then((historyTag) => {
        return SessionHistory.findOneAndUpdate(
          { sessionId: this.sessionId },
          { $addToSet: { tags: historyTag._id } }
        ).exec();
      }).catch((err) => {
        log.info(err);
      });
    }
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
        startTimestamp: inProgressScenario.startTimestamp,
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
          featureName: scenario.featureName,
          result: scenario.result,
          executor: scenario.executor
        });
        Session.pushScenarioToStatusList(status, scenario);
      }
    }
    return status;
  }

  saveHistory() {
    return new Promise((resolve) => {
      SessionHistory.update({ sessionId: this.sessionId }, {
        details: {
          ...this.getSessionDetails(),
          endDate: new Date()
        },
        briefStatus: this.getBriefStatus()
      }).exec()
      .then(() => {
        resolve();
      })
    });
  }
}

Session.pushScenarioToStatusList = function pushScenarioToStatusList(resultObject, scenario) {
  resultObject[scenario.result].push({
    scenarioId: scenario._id,
    classpath: scenario.classpath,
    scenarioLine: scenario.scenarioLine,
    scenarioName: scenario.scenarioName,
    featureName: scenario.featureName,
    result: scenario.result,
    executor: scenario.executor
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
    + session.getScenariosCount(Session.STATE_QUEUE) === 0) {
    clearInterval(session.trackInProgressTimeout);
    log.debug(`${session.sessionId}: Tests execution done`);
    let haveReports = false;

    if (session.getScenariosCount(Session.STATE_DONE) > 0) {
      session.saveHistory().then(() => {
        log.debug(`${session.sessionId}: Tests execution done. Preparing reports...`);
        for (const key of Object.keys(session.doneScenarios)) {
          let combinedReport = null;

          const featureReports = session.doneScenarios[key];

          for (const scenario of featureReports) {
            if (!scenario.report) {
              log.error(`No report for scenario ${scenario.getScenarioId()} saved`);
              continue;
            }
            const report = scenario.report[0];

            if (report) {
              if (!combinedReport) {
                combinedReport = scenario.report;
              } else {
                combinedReport[0].elements = combinedReport[0].elements.concat(report.elements);
              }
            } else {
              log.error(`Report for scenario ${scenario.getScenarioId()} was not sent correctly`);
            }
          }
          const filename = key.replace(/\W/g, '');

          if (combinedReport) {
            fs.writeFileSync(`${session.sessionPath}/${filename}.json`, JSON.stringify(combinedReport, null, 4));
            haveReports = true;
          }
        }
        util.zipDirectory(session.sessionPath, `${session.sessionPath}/reports.zip`);
      });
    }

    if (!haveReports) {
      fs.writeFileSync(`${session.sessionPath}/dummy.txt`, '', {});
      util.zipDirectory(session.sessionPath, `${session.sessionPath}/reports.zip`);
    }

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

  for (const scenarioId of inProgressScenariosIds) {
    const inProgressScenario = session.inProgressScenarios[scenarioId];
    const requestDate = inProgressScenario.startTimestamp;

    if ((Date.now() - requestDate) / 1000 > Session.SCENARIO_TIMEOUT_SEC) {
      log.error(
        `${session.sessionId}: scenario execution were not finished in ${Session.SCENARIO_TIMEOUT_SEC} seconds.
         Moving it back to scenarios queue`);
      session.scenarios.push(inProgressScenario);
      delete session.inProgressScenarios[scenarioId];
    }
  }
};

Session.sessions = {};

Session.SCENARIO_TIMEOUT_SEC = 1800;

Session.STATE_QUEUE = 'queue';
Session.STATE_IN_PROGRESS = 'in progress';
Session.STATE_DONE = 'done';
Session.STATE_PASSED = 'passed';
Session.STATE_FAILED = 'failed';
Session.STATE_SKIPPED = 'skipped';
Session.STATE_ERROR = 'error';

Session.OK = 'OK';
Session.NOT_FOUND = 'NOT_FOUND';
Session.IN_PROGRESS = 'IN_PROGRESS';
Session.FINALIZATION = 'FINALIZATION';

module.exports = Session;
