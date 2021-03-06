import express from 'express';
import mime from 'mime';
import path from 'path';
import fs from 'fs';

import Session from 'libs/session';
import util from 'libs/util';

import mongoose from 'mongoose';

import { SessionHistory, HistoryFeature, HistoryScenario, HistoryTag } from 'libs/mongoose';

import logTemplate from 'libs/log';
const log = logTemplate(module);

const router = express.Router();

function extendTimeout(req, res, next) {
  res.setTimeout(480000, () => { /* Handle timeout */
  });
  next();
}

function getSessionLostObject(sessionId) {
  return { session: { sessionId, error: 'session_lost' } };
}

router.get('/', (req, res) => {
  const responseObject = {};

  if (Session.sessions) {
    responseObject.availableSessions = {};
    for (const sessionId of Object.keys(Session.sessions)) {
      responseObject.availableSessions[sessionId] = {
        details: Session.sessions[sessionId].getSessionDetails(),
        briefStatus: Session.sessions[sessionId].getBriefStatus()
      };
    }
  }
  res.send(responseObject);
});

router.get('/history', (req, res) => {
  const responseObject = {};
  const histories = SessionHistory.find({}).sort({ 'details.endDate': -1 }).limit(30);

  histories.exec()
    .then((sessions) => {
      responseObject.sessionsHistory = {};
      for (const session of sessions) {
        if (!session.details || !session.details.sessionId) {
          continue;
        }
        responseObject.sessionsHistory[session.details.sessionId] = session;
      }
      res.send(responseObject);
    })
    .catch((err) => {
      log.error(err);
    });
});

router.delete('/history', async (req, res) => {
  var result
  try {
    result = await HistoryScenario.deleteMany({ 'timestamp' : null }).exec()
    var deletedScenariosCount = result.deletedCount
    result = await HistoryScenario.deleteMany({ 'timestamp' : {
      $lt: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000)
    }})
    deletedScenariosCount += result.deletedCount
  } catch (err) {
    return res.status(400).send({err: err})
  }

  try {
    result = await HistoryFeature.deleteMany({ 'timestamp' : null }).exec()
    var deletedFeaturesCount = result.deletedCount
    result = await HistoryFeature.deleteMany({ 'timestamp' : {
      $lt: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000)
    }})
    deletedFeaturesCount = result.deletedCount
  } catch (err) {
    return res.status(400).send({err: err})
  }

  try {
    result = await HistoryTag.deleteMany({ 'timestamp' : null }).exec()
    var deletedTagsCount = result.deletedCount
    result = await HistoryTag.deleteMany({ 'timestamp' : {
      $lt: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000)
    }})
    deletedTagsCount += result.deletedCount
  } catch (err) {
    return res.status(400).send({err: err})
  }

  try {
    result = await SessionHistory.deleteMany({ 'timestamp' : null }).exec()
    var deletedSessionsCount = result.deletedCount
    result = await SessionHistory.deleteMany({ 'timestamp' : {
      $lt: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000)
    }})
    deletedSessionsCount += result.deletedCount
  } catch (err) {
    return res.status(400).send({err: err})
  }

  var scenariosCount = await HistoryScenario.count().exec()
  var tagsCount = await HistoryTag.count().exec()
  var featuresCount = await HistoryFeature.count().exec()
  var sessionsCount = await SessionHistory.count().exec()

  return res.send({
    deletedScenariosCount,
    deletedFeaturesCount,
    deletedTagsCount,
    deletedSessionsCount,
    scenariosCount,
    tagsCount,
    featuresCount,
    sessionsCount
  })
})

router.get('/history/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  const responseObject = {};
  const histories = SessionHistory.findOne({ 'details.sessionId': sessionId }).populate('features');

  histories.exec()
    .then((history) => {
      responseObject[history.details.sessionId] = history;
      res.send(responseObject);
    })
    .catch((err) => {
      log.error(err);
    });
});

/**
 * @api {get} /sessions/history/:sessionId/percent Get Passed Scenarios Percent
 *
 * @apiDescription  Get percent of passed scenarios
 *
 * @apiName Get Passed Scenarios Percent
 * @apiGroup sessions
 *
 * @apiParam {string} sessionId session ID
 *
 * @apiSuccess (Success-Response) {number} percent
 */
router.get('/history/:sessionId/percent', (req, res) => {
  const sessionId = req.params.sessionId;
  const history = SessionHistory.findOne({ 'details.sessionId': sessionId });

  history.exec()
    .then((historyObject) => {
      if (!historyObject) {
        return res.send('0');
      }
      const { passedCount, skippedCount, doneCount } = historyObject.briefStatus;

      res.send(((passedCount / (doneCount - skippedCount)) * 100).toString());
    })
    .catch((err) => {
      log.error(err);
    });
});

/**
 * @api {get} /history/:sessionId/features/:featureId Get Passed Scenarios Percent
 *
 * @apiDescription  Get feature history
 *
 * @apiName Get Feature History
 * @apiGroup sessions
 *
 * @apiParam {string} sessionId session ID
 * @apiParam {string} featureId feature ID
 *
 * @apiSuccess (Success-Response) {object}  payload response payload
 */
router.get('/history/:sessionId/features/:featureId', (req, res) => {
  const featureId = req.params.featureId;
  const feature = HistoryFeature.findOne({ _id: featureId }).populate('scenarios');

  feature.exec()
    .then((featureObject) => {
      if (!featureObject) {
        return res.status(404).send({ 'error': 'no history for feature' });
      }

      res.send(featureObject);
    })
    .catch((err) => {
      log.error(err);
      return res.status(404).send({ 'error': `no history for feature ${featureId}` });
    });
});

/**
 * @api {get} /sessions/history/:sessionId/zip Get Session ZIP Report
 *
 * @apiDescription  Download ZIP archive with cucumber reports
 *
 * @apiName Get Session ZIP Report
 * @apiGroup sessions
 *
 * @apiParam {string} sessionId session ID
 *
 * @apiSuccess (Success-Response) {file} reports.zip
 */
router.get('/history/:sessionId/zip', (req, res) => {
  const file = `${process.env.NODE_PATH}/../public/results/${req.params.sessionId}/reports.zip`;

  fs.stat(file, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).send({
          error: 'not_found',
          message: `no reports.zip for session ${req.params.sessionId}`
        });
      }

      throw err;
    }

    const filename = path.basename(file);
    const mimetype = mime.lookup(file);

    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-type', mimetype);

    const fileStream = fs.createReadStream(file);

    fileStream.pipe(res);
  });
});

/**
 * @api {get} /sessions/start?project=:project&scope=:scope&tags=:tags&[link=:link] Start New Session
 *
 * @apiDescription  Take next scenario from queue
 *
 * @apiName Start New Session
 * @apiGroup sessions
 *
 * @apiParam {string} project project ID
 * @apiParam {string} scope One of the 5 options:
 *                            full - all project scenarios
 *                            dev - new scenarios that did not pass more than 5 executions in a row
 *                            daily - non-development scenarios that passed last execution
 *                            failed - non-development scenarios that did not pass last execution
 *                            custom - scenarios marked with tag specified in tags param (project tag will be ignored)
 * @apiParam {string} tags tag
 * @apiParam {string} link test link
 *
 * @apiSuccess (Success-Response) {string}  sessionId
 */
router.get('/start', (req, res) => {
  if (!req.query.project) {
    return res.status(400).send({ error: 'no_project_specified' });
  }

  if (!req.query.scope) {
    return res.status(400).send({ error: 'no_scope_specified' });
  }

  const filter = {};

  filter.scope = req.query.scope;

  if (req.query.scope === 'custom') {
    if (!req.query.tags) {
      return res.status(400).send({ error: 'no_custom_tags_specified' });
    }
    filter.tags = req.query.tags.split(',');
  }

  const project = req.query.project;

  const iterations = req.query.iterations ? req.query.iterations : 1;

  const timeout = req.query.timeout ? req.query.timeout : 1800;

  const newSession = new Session(util.generateGUID(), project, filter, iterations, timeout);

  if (req.query.link) {
    newSession.jenkinsLink = req.query.link;
  }

  Session.sessions[newSession.getSessionId()] = newSession;
  res.send(newSession.getSessionId());
});

/**
 * @api {get} /sessions/:sessionId/next Get Next Scenario
 *
 * @apiDescription  Take next scenario from queue
 *
 * @apiName Get Next Scenario
 * @apiGroup sessions
 *
 * @apiSuccess (Success-Response) {object}  payload response payload
 * @apiSuccess (Success-Response) {string}  payload.state session state
 * @apiSuccess (Success-Response) {object}  payload.scenario next scenario details
 */
router.get('/:sessionId/next', (req, res) => {
  const currentSession = Session.sessions[req.params.sessionId];
  const executor = req.query.executor;

  // respond with empty object
  if (!currentSession) {
    return res.send({ state: Session.NOT_FOUND });
  }
  const nextScenario = currentSession.getNextScenario(executor);

  if (nextScenario) {
    const responseData = { state: Session.OK, scenario: {} };

    responseData.scenario.path = `${nextScenario.classpath}:${nextScenario.scenarioLine}`;
    responseData.scenario.id = nextScenario._id;
    res.send(responseData);
  } else {
    const inProgressCount = currentSession.getScenariosCount(Session.STATE_IN_PROGRESS);

    if (inProgressCount > 0) {
      res.send({ state: Session.IN_PROGRESS });
    } else {
      res.send({ state: Session.FINALIZATION });
    }
  }
});

/**
 * @api {post} /sessions/:sessionId/return/:scenarioId Return Scenario to queue
 *
 * @apiDescription  Return session scenario to queue
 *
 * @apiName Return Scenario
 * @apiGroup sessions
 *
 * @apiParam {string} sessionId  session ID
 * @apiParam {string} scenarioId scenario ID
 *
 * @apiSuccess (Success-Response) {bool}  success true
 */
router.get('/:sessionId/return/:scenarioId', (req, res) => {
  const currentSession = Session.sessions[req.params.sessionId];

  if (!currentSession) {
    return res.send(getSessionLostObject(req.params.sessionId));
  }
  const scenario = currentSession.inProgressScenarios[req.params.scenarioId];

  if (!scenario) {
    res.send({
      session: { sessionId: req.params.sessionId, scenario: req.params.scenarioId }, error: 'no_scenario'
    });
  }

  currentSession.pushScenarioToQueue(scenario);
  res.send({ success: true });
});

/**
 * @api {get} /sessions/:sessionId/state Get Session State
 *
 * @apiDescription  Get session state
 *
 * @apiName Get Session State
 * @apiGroup sessions
 *
 * @apiSuccess (Success-Response) {string}  either session state or relative reports.zip path
 */
router.get('/:sessionId/state', extendTimeout, (req, res) => {
  const currentSession = Session.sessions[req.params.sessionId];

  if (!currentSession) {
    return res.send(`/results/${req.params.sessionId}/reports.zip`);
  }
  const result = Session.sessions[req.params.sessionId].getSessionState();

  if (!result || result === Session.NOT_FOUND) {
    delete Session.sessions[req.params.sessionId];
    res.send(`/results/${req.params.sessionId}/reports.zip`);
  } else {
    res.send(result);
  }
});

/**
 * @api {post} /sessions/:sessionId/reports Save Scenario Report
 *
 * @apiDescription  Save scenario report
 *
 * @apiName Save Scenario Report
 * @apiGroup sessions
 *
 * @apiParam {string} id scenarioId
 * @apiParam {object} report Cucumber JSON report
 *
 * @apiSuccess (Success-Response) {object}  report scenario report
 */
router.post('/:sessionId/reports', (req, res) => {
  const currentSession = Session.sessions[req.params.sessionId];
  const scenarioId = req.body.id;
  const scenarioReport = req.body.report;

  if (!currentSession) {
    return res.send(getSessionLostObject(req.params.sessionId));
  }
  currentSession.saveScenarioResult(scenarioId, scenarioReport, (err) => {
    if (err) {
      log.error(err);
      return res.status(404).send({
        error: {
          message: 'Session finished or scenario was not executed in 20 minutes'
        }
      });
    }
  });
  res.send({ scenario: { scenarioId }, success: true });
});

/**
 * @api {get} /sessions/:sessionId/runtime/:scenarioId Get Scenario Runtime Report
 *
 * @apiDescription  Get scenario runtime report
 *
 * @apiName Get Scenario Runtime Report
 * @apiGroup sessions
 *
 * @apiParam {string} sessionId  session ID
 * @apiParam {string} scenarioId scenario ID
 *
 * @apiSuccess (Success-Response) {object}  report scenario report
 */
router.get('/:sessionId/runtime/:scenarioId', (req, res) => {
  const currentSession = Session.sessions[req.params.sessionId];

  if (!currentSession) {
    return res.send(getSessionLostObject(req.params.sessionId));
  }
  const scenario = currentSession.inProgressScenarios[req.params.scenarioId];

  if (scenario) {
    return res.send({ report: scenario.report });
  }

  res.send({
    session: { sessionId: req.params.sessionId, scenario: req.params.scenarioId }, error: 'no_scenario'
  });
});

/**
 * @api {post} /sessions/:sessionId/runtime/:scenarioId Update Scenario Runtime Report
 *
 * @apiDescription  Update scenario runtime report
 *
 * @apiName Update Scenario Runtime Report
 * @apiGroup sessions
 *
 * @apiParamExample {json} Request-Example:
 * TODO: add request example
 *
 * @apiSuccess (Success-Response) {object}  report scenario report
 */
router.post('/:sessionId/runtime/:scenarioId', (req, res) => {
  const currentSession = Session.sessions[req.params.sessionId];

  if (!currentSession) {
    return res.send(getSessionLostObject(req.params.sessionId));
  }

  const scenario = currentSession.inProgressScenarios[req.params.scenarioId];

  if (scenario) {
    currentSession.updateScenarioRuntimeReport(req.params.scenarioId, req.body);

    return res.send({ report: scenario.runtime });
  }

  res.send({
    session: { sessionId: req.params.sessionId, scenario: req.params.scenarioId }, error: 'no_scenario'
  });
});

router.get('/:sessionId/reports/:scenarioId', async (req, res) => {
  const currentSession = Session.sessions[req.params.sessionId];

  if (!currentSession) {
    return res.send(getSessionLostObject(req.params.sessionId));
  }
  try {
    const scenario = await HistoryScenario.findOne({'scenario.scenarioId': mongoose.Types.ObjectId(req.params.scenarioId)}).exec();

    if (scenario && scenario.scenario) {
      return res.send({report: scenario.scenario.report});
    }
  } catch (err) {
    return res.status(400).send({err: err});
  }

  res.send({
    session: { sessionId: req.params.sessionId, scenario: req.params.scenarioId }, error: 'no_scenario'
  });
});

/**
 * @api {post} /sessions/:sessionId/skip/:scenarioId Skip Scenario
 *
 * @apiDescription  Skip session scenario
 *
 * @apiName Skip Scenario
 * @apiGroup sessions
 *
 * @apiParam {string} sessionId  session ID
 * @apiParam {string} scenarioId scenario ID
 *
 * @apiSuccess (Success-Response) {bool}  success true
 */
router.post('/:sessionId/skip/:scenarioId', (req, res) => {
  const currentSession = Session.sessions[req.params.sessionId];

  if (!currentSession) {
    res.send(getSessionLostObject(req.params.sessionId));
  }
  currentSession.skipScenario(req.params.scenarioId);
  res.send({ success: true });
});

router.get('/:sessionId', (req, res) => {
  const currentSession = Session.sessions[req.params.sessionId];

  if (currentSession) {
    const details = currentSession.getSessionDetails();
    const briefStatus = currentSession.getBriefStatus();
    const status = currentSession.getStatus();

    res.send({ session: { sessionId: req.params.sessionId, details, briefStatus, status } });
  } else {
    res.send(getSessionLostObject(req.params.sessionId));
  }
});

/**
 * @api {post} /sessions/:sessionId/finish Finish Session
 *
 * @apiDescription  Remove all in progress or not started scenarios and save executed scenarios history
 *
 * @apiName Finish Session
 * @apiGroup sessions
 *
 * @apiParam {string} sessionId session ID
 *
 * @apiSuccess (Success-Response) {bool}  success true
 */
router.post('/:sessionId/finish', (req, res) => {
  const currentSession = Session.sessions[req.params.sessionId];

  if (!currentSession) {
    return res.send(getSessionLostObject(req.params.sessionId));
  }
  currentSession.stopSession();
  res.send({ success: true });
});

/**
 * @api {post} /sessions/:sessionId/forceFinish Force Finish Session (Skip In Progress scenarios)
 *
 * @apiDescription  Remove all in progress or not started scenarios and save executed scenarios history
 *
 * @apiName Finish Session
 * @apiGroup sessions
 *
 * @apiParam {string} sessionId session ID
 *
 * @apiSuccess (Success-Response) {bool}  success true
 */
router.post('/:sessionId/forceFinish', (req, res) => {
  const currentSession = Session.sessions[req.params.sessionId];

  if (!currentSession) {
    return res.send(getSessionLostObject(req.params.sessionId));
  }
  currentSession.stopSession(true);
  res.send({ success: true });
});

/**
 * @api {delete} /sessions/:sessionId Delete Session
 *
 * @apiDescription  Delete session without saving it's results
 *
 * @apiName Delete Session
 * @apiGroup sessions
 *
 * @apiParam {string} sessionId session ID
 *
 * @apiSuccess (Success-Response) {bool}  success true
 */
router.delete('/:sessionId', (req, res) => {
  const currentSession = Session.sessions[req.params.sessionId];

  if (!currentSession) {
    res.send(getSessionLostObject(req.params.sessionId));
  }
  currentSession.stopSession();
  delete Session.sessions[req.params.sessionId];
  res.send({ success: true });
});

export default router;
