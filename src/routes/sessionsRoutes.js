import express from 'express';

import Session from 'libs/session';
import util from 'libs/util';

import logTemplate from 'libs/log';
const log = logTemplate(module);

const router = express.Router();

/**
 * start new session, return sessionId
 */
router.get('/start', (req, res) => {
  if (!req.query.tags) {
    res.statusCode = 400;
    res.send({ error: 'Tags are not specified for run' });
  }
  if (!req.query.mode) {
    res.statusCode = 400;
    res.send({ error: 'Filter is not specified for run' });
  }
  if (!req.query.project) {
    res.statusCode = 400;
    res.send({ error: 'Project is not specified for run' });
  }
  const tags = req.query.tags.split(',');
  const mode = req.query.mode;
  const project = req.query.project;
  const newSession = new Session(util.generateGUID(), tags, mode, project);

  if (!Session.sessions) {
    Session.sessions = {};
  }
  Session.sessions[newSession.getSessionId()] = newSession;
  res.send(newSession.getSessionId());
});

/**
 * take next scenario from session queue
 */
router.get('/:sessionId/next', (req, res) => {
  const currentSession = Session.sessions[req.params.sessionId];
  const executor = req.query.executor;

  // respond with empty object
  if (!currentSession) {
    res.send({ state: Session.NOT_FOUND });
    return;
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
 * post executed scenario report to server
 */
router.post('/:sessionId/result', (req, res) => {
  const scenarioId = req.body.id;
  const scenarioReport = req.body.report;

  if (!Session.sessions[req.params.sessionId]) {
    res.statusCode = 404;
    return res.send(`Session ${req.params.sessionId} does not exist`);
  }
  Session.sessions[req.params.sessionId].saveScenarioResult(scenarioId, scenarioReport, (err) => {
    if (err) {
      log.error(err);
      return res.status(404).send(err);
    }
  });
  res.send(`Report for scenario ${scenarioId} successfully saved`);
});

function extendTimeout(req, res, next) {
  res.setTimeout(480000, () => { /* Handle timeout */
  });
  next();
}

/**
 * either receive link for reports or get message that session is still in progress
 */
router.get('/:sessionId/state', extendTimeout, (req, res) => {
  if (!Session.sessions[req.params.sessionId]) {
    res.send(`/results/${req.params.sessionId}/reports.zip`);
    return;
  }
  const result = Session.sessions[req.params.sessionId].getSessionState();

  if (!result || result === Session.NOT_FOUND) {
    delete Session.sessions[req.params.sessionId];
    res.send(`/results/${req.params.sessionId}/reports.zip`);
  } else {
    res.send(result);
  }
});

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

/**
 * get current session information
 */
router.get('/:sessionId', (req, res) => {
  const session = Session.sessions[req.params.sessionId];

  if (session) {
    const details = session.getSessionDetails();
    const status = session.getStatus();

    res.send({ session: { sessionId: req.params.sessionId, details, status } });
  } else {
    res.send({ session: { sessionId: req.params.sessionId, details: null, status: null, error: 'session_lost' } });
  }
});

router.get('/:sessionId/reports/:scenarioId', (req, res) => {
  const session = Session.sessions[req.params.sessionId];

  if (!session) {
    return res.send({ session: { sessionId: req.params.sessionId }, error: 'no_session' });
  }
  for (const feature of Object.keys(session.doneScenarios)) {
    for (const scenario of session.doneScenarios[feature]) {
      if (req.params.scenarioId === scenario._id.toString()) {
        return res.send({ report: scenario.report });
      }
    }
  }
  res.send({
    session: { sessionId: req.params.sessionId, scenario: req.params.scenarioId }, error: 'no_scenario'
  });
});

router.post('/:sessionId/skip/:scenarioId', (req, res) => {
  const session = Session.sessions[req.params.sessionId];

  if (!session) {
    res.send({ session: { sessionId: req.params.sessionId, status: null }, error: 'session_lost' });
  }
  session.skipScenario(req.params.scenarioId);
  res.send({ success: true });
});

router.post('/:sessionId/finish', (req, res) => {
  const session = Session.sessions[req.params.sessionId];

  if (!session) {
    return res.send({ session: { sessionId: req.params.sessionId, status: null, error: 'session_lost' } });
  }
  session.stopSession();
  res.send({ success: true });
});

router.delete('/:sessionId', (req, res) => {
  const session = Session.sessions[req.params.sessionId];

  if (!session) {
    res.send({ session: { sessionId: req.params.sessionId, status: null, error: 'session_lost' } });
  }
  session.stopSession();
  delete Session.sessions[req.params.sessionId];
  res.send({ success: true });
});

export default router;
