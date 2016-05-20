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
  var newSession = new Session(util.generateGUID());
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
  // respond with empty object
  if (!currentSession) {
    res.send({state: Session.NOT_FOUND});
    return;
  }
  let nextScenario = currentSession.getNextScenario();
  if (nextScenario) {
    var responseData = { state: Session.OK, scenario: {} };
    responseData.scenario.path = nextScenario.classpath + ':' + nextScenario.scenarioLine;
    responseData.scenario.id = nextScenario._id;
    res.send(responseData);
  } else {
    var inProgressCount = currentSession.getScenariosCount(Session.STATE_IN_PROGRESS);
    if (inProgressCount > 0) {
      res.send({ state: Session.IN_PROGRESS });
    } else {
      res.send({ state: Session.FINALIZATION });
    }
  }
});

router.post('/:sessionId/result', (req, res) => {
  var scenarioId = req.body.id;
  var scenarioReport = req.body.report;

  this.sessions[req.params.sessionId].saveScenarioResult(scenarioId, scenarioReport, (err) => {
    if (err) {
      log.error(err);
      res.status(500).send(err);
    }
  });
  res.send('Report for scenario ' + scenarioId + ' successfully saved');
});

function extendTimeout(req, res, next) {
  res.setTimeout(480000, function () { /* Handle timeout */ });
  next();
}

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

router.get('/list', (req, res) => {
  var responseObject = {};
  if (this.sessions) {
    responseObject.availableSessions = Object.keys(this.sessions);
  }
  res.render('sessions', {sessions: this.sessions});
});

router.get('/:sessionId/info', (req, res) => {
  let status = this.sessions[req.params.sessionId].getStatus();
  res.render('session', {status: status});
});

module.exports = router;
