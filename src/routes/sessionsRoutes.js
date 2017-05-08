import express from 'express';

import Session from 'libs/session';
import util from 'libs/util';

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

router.get('/start', (req, res) => {
  if (!req.query.project) {
    res.statusCode = 400;
    return res.send({ error: 'no_project_specified' });
  }

  if (!req.query.scope) {
    res.statusCode = 400;
    return res.send({ error: 'no_scope_specified' });
  }

  const filter = {};

  filter.scope = req.query.scope;

  if (req.query.scope === 'custom') {
    if (!req.query.tags) {
      res.statusCode = 400;
      return res.send({ error: 'no_custom_tags_specified' });
    }
    filter.tags = req.query.tags.split(',');
  }

  const project = req.query.project;

  const newSession = new Session(util.generateGUID(), project, filter);

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
    return res.send(getSessionLostObject(req.params.sessionId));
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
 * either receive link for reports or get message that session is still in progress
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
 * post executed scenario report to server
 */
router.post('/:sessionId/reports/:scenarioId', (req, res) => {
  const currentSession = Session.sessions[req.params.sessionId];
  const scenarioReport = req.body.report;

  if (!currentSession) {
    return res.send(getSessionLostObject(req.params.sessionId));
  }
  currentSession.saveScenarioResult(req.params.scenarioId, scenarioReport, (err) => {
    if (err) {
      log.error(err);
      return res.status(404).send(err);
    }
  });
  res.send(`Report for scenario ${req.params.scenarioId} successfully saved`);
});

router.get('/:sessionId/reports/:scenarioId', (req, res) => {
  const currentSession = Session.sessions[req.params.sessionId];

  if (!currentSession) {
    return res.send(getSessionLostObject(req.params.sessionId));
  }
  for (const feature of Object.keys(currentSession.doneScenarios)) {
    for (const scenario of currentSession.doneScenarios[feature]) {
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
    const status = currentSession.getStatus();

    res.send({ session: { sessionId: req.params.sessionId, details, status } });
  } else {
    res.send(getSessionLostObject(req.params.sessionId));
  }
});

router.post('/:sessionId/finish', (req, res) => {
  const currentSession = Session.sessions[req.params.sessionId];

  if (!currentSession) {
    return res.send(getSessionLostObject(req.params.sessionId));
  }
  currentSession.stopSession();
  res.send({ success: true });
});

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