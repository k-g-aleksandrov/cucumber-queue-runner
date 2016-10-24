'use strict';

let express = require('express');
let router = express.Router();
let log = require('libs/log')(module);

let Session = require('libs/session');

let util = require('libs/util');

this.sessions = {};

/**
 * start new session, return sessionId
 */
router.get('/start', (req, res) => {
  if (!req.query.tags) {
    res.statusCode = 400;
    res.send({error: 'Tags are not specified for run'});
  }
  if (!req.query.mode) {
    res.statusCode = 400;
    res.send({error: 'Filter is not specified for run'});
  }
  if (!req.query.project) {
    res.statusCode = 400;
    res.send({error: 'Project is not specified for run'});
  }
  var tags = req.query.tags.split(',');
  let mode = req.query.mode;
  let project = req.query.project;
  var newSession = new Session(util.generateGUID(), tags, mode, project);
  if (!this.sessions) {
    this.sessions = {};
  }
  this.sessions[newSession.getSessionId()] = newSession;
  res.send(newSession.getSessionId());
});

/**
 * take next scenario from session queue
 */
router.get('/:sessionId/next', (req, res) => {
  let currentSession = this.sessions[req.params.sessionId];
  let executor = req.query.slaveId;
  // respond with empty object
  if (!currentSession) {
    res.send({state: Session.NOT_FOUND});
    return;
  }
  let nextScenario = currentSession.getNextScenario(executor);
  if (nextScenario) {
    var responseData = {state: Session.OK, scenario: {}};
    responseData.scenario.path = nextScenario.classpath + ':'
      + nextScenario.scenarioLine;
    responseData.scenario.id = nextScenario._id;
    res.send(responseData);
  } else {
    var inProgressCount = currentSession.getScenariosCount(Session.STATE_IN_PROGRESS);
    if (inProgressCount > 0) {
      res.send({state: Session.IN_PROGRESS});
    } else {
      res.send({state: Session.FINALIZATION});
    }
  }
});

/**
 * post executed scenario report to server
 */
router.post('/:sessionId/result', (req, res) => {
  var scenarioId = req.body.id;
  var scenarioReport = req.body.report;

  if (!this.sessions[req.params.sessionId]) {
    res.statusCode = 404;
    return res.send('Session ' + req.params.sessionId + ' does not exist');
  }
  this.sessions[req.params.sessionId].saveScenarioResult(scenarioId, scenarioReport, (err) => {
    if (err) {
      log.error(err);
      return res.status(404).send(err);
    }
  });
  res.send('Report for scenario ' + scenarioId + ' successfully saved');
});

function extendTimeout(req, res, next) {
  res.setTimeout(480000, function () { /* Handle timeout */
  });
  next();
}

/**
 * either receive link for reports or get message that session is still in progress
 */
router.get('/:sessionId/state', extendTimeout, (req, res) => {
  if (!this.sessions[req.params.sessionId]) {
    res.send('/results/' + req.params.sessionId + '/reports.zip');
    return;
  }
  var result = this.sessions[req.params.sessionId].getSessionState();
  if (!result || result === Session.NOT_FOUND) {
    delete this.sessions[req.params.sessionId];
    res.send('/results/' + req.params.sessionId + '/reports.zip');
  } else {
    res.send(result);
  }
});

/**
 * list available sessions
 */
router.get('/list', (req, res) => {
  var responseObject = {};
  if (this.sessions) {
    responseObject.availableSessions = Object.keys(this.sessions);
  }
  res.render('sessions', {sessions: this.sessions, error: {state: req.query.state, info: req.query.session}});
});

/**
 * get current session information
 */
router.get('/:sessionId/details', (req, res) => {
  let session = this.sessions[req.params.sessionId];
  if (session) {
    let status = session.getStatus();
    res.render('session', {sessionId: req.params.sessionId, status: status});
  } else {
    res.redirect('/sessions/list?state=sessionlost&session=' + req.params.sessionId);
  }
});

router.get('/:sessionId/reports/:scenarioId', (req, res) => {
  let session = this.sessions[req.params.sessionId];
  if (!session) {
    return res.send('<div class="alert alert-warning">Seems like session is already finished. See Cucumber Report on Jenkins</div>');
  }
  for (let feature of Object.keys(session.doneScenarios)) {
    for (let scenario of session.doneScenarios[feature]) {
      if (req.params.scenarioId === scenario._id.toString()) {
        return res.render('report', {report: scenario.report});
      }
    }
  }
  res.send({error: 'Scenario ' + req.params.scenarioId + ' does not exist or not yet finished.'});
});

router.get('/:sessionId/skip/:scenarioId', (req, res) => {
  let session = this.sessions[req.params.sessionId];
  if (!session) {
    return res.redirect('/sessions/list?state=sessionlost&session=' + req.params.sessionId);
  }
  session.skipScenario(req.params.scenarioId);
  res.redirect('/sessions/' + req.params.sessionId + '/details#queue');
});

router.get('/:sessionId/finish', (req, res) => {
  this.sessions[req.params.sessionId].stopSession();
  res.redirect('/sessions/list');
});

router.get('/:sessionId/remove', (req, res) => {
  this.sessions[req.params.sessionId].stopSession();
  delete this.sessions[req.params.sessionId];
  res.redirect('/sessions/list');
});

module.exports = router;
