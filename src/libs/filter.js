'use strict';

let log = require('libs/log')(module);

let Project = require('libs/mongoose').Project;
let Scenario = require('libs/mongoose').Scenario;
let Execution = require('libs/mongoose').Execution;

module.exports.development = {
  id: 'dev',
  displayName: 'Development',
  executionRules: [{
    result: 'passed',
    number: 5,
    mode: 'row',
    inverted: true
  }],
  description: 'Have less than 5 passed executions in a row'
};

module.exports.daily = {
  id: 'daily',
  displayName: 'Daily',
  executionRules: [{
    result: 'passed',
    number: 5,
    mode: 'row',
    inverted: false
  }, {
    result: 'passed',
    number: 1,
    mode: 'last',
    inverted: false
  }],
  description: 'Have at least 5 passed executions in a row, and passed last execution'
};

module.exports.muted = {
  id: 'muted',
  displayName: 'Failed',
  executionRules: [{
    result: 'passed',
    number: 5,
    mode: 'row',
    inverted: false
  }, {
    result: 'passed',
    number: 1,
    mode: 'last',
    inverted: true
  }],
  description: 'Have at least 5 passed executions in a row, and failed last execution'
};

module.exports.full = {
  id: 'full',
  displayName: 'Full Scope',
  description: 'All scenarios tagged by project tag',
  ignoreProjectTag: false,
  hideInUi: true
};

module.exports.custom = {
  id: 'custom',
  displayName: 'Custom Scope',
  description: 'Custom scope',
  ignoreProjectTag: true,
  hideInUi: true
};

function validateExecutionsRowRule(scenario, rule) {
  let maxInARow = 0;
  let currentInARow = 0;
  let result = false;
  if (scenario.executions) {
    for (let exec of scenario.executions) {
      if (exec.result === rule.result) {
        currentInARow++;
      } else if (currentInARow > maxInARow) {
        maxInARow = currentInARow;
        currentInARow = 0;
      }
    }
    if (currentInARow > maxInARow) {
      maxInARow = currentInARow;
    }
    if (maxInARow >= rule.number) {
      result = true;
    }
  }

  return (result && !rule.inverted) || (!result && rule.inverted);
}

function validateLastExecutionsRule(scenario, rule) {
  let result = false;
  if (scenario.executions) {
    let count = 0;
    for (let i = scenario.executions.length - 1; i >= 0; i--) {
      if (scenario.executions[i].result == rule.result) {
        count++;
      } else {
        break;
      }
    }
    if (count >= rule.number) {
      result = true;
    }
  }
  return (result && !rule.inverted) || (!result && rule.inverted);
}

function validateExecutionRule(scenario, rule) {
  if (rule.mode === 'row') {
    return validateExecutionsRowRule(scenario, rule);
  } else if (rule.mode === 'last') {
    return validateLastExecutionsRule(scenario, rule);
  } else {
    return true;
  }
}

function checkProjectTag(scenario, projectTag) {
  return scenario.tags && scenario.tags.indexOf(projectTag) >= 0;
}

module.exports.getFilterByName = function (filter) {
  if ('full' === filter) {
    return this.full;
  } else if ('dev' === filter) {
    return this.development;
  } else if ('failed' === filter) {
    return this.muted;
  } else if ('daily' === filter) {
    return this.daily;
  } else if ('custom' === filter) {
    return this.custom;
  }
};

module.exports.applyCustomFilterToProject = function (projectId, tags, callback) {
  Project.findOne({projectId: projectId}, (err, project) => {
    if (err) {
      log.error(err);
    }
    if (!project) {
      log.error('Failed to find project with id ' + projectId);
    }
    let filteredScenarios = [];
    log.debug('Found project ' + projectId + '. Search for scenarios related to this project...');
    Scenario.find({project: project.projectId}, (err, scenarios) => {
      if (err) {
        log.error(err);
      }
      let scenarioPromises = scenarios.map((sc) => {
        return new Promise((scResolve) => {
          Execution.findOne({scenarioId: sc.getScenarioId()}, (err, execution) => {
            sc.projectTag = project.tag;
            if (execution && execution.executions) {
              sc.executions = execution.executions;
            }
            if (tags && this.applyTags(sc, tags)) {
              filteredScenarios.push(sc);
            }
            scResolve();
          });
        });
      });
      Promise.all(scenarioPromises).then(() => {
        log.info(JSON.stringify(filteredScenarios));
        callback(null, project, filteredScenarios);
      }).catch(log.error);
    });
  });
};

module.exports.applyFilterToProject = function (projectId, filter, callback) {
  Project.findOne({projectId: projectId}, (err, project) => {
    if (err) {
      log.error(err);
    }
    if (!project) {
      log.error('Failed to find project with id ' + projectId);
    }
    let filteredScenarios = [];
    log.debug('Found project ' + projectId + '. Search for scenarios related to this project...');
    Scenario.find({project: project.projectId}, (err, scenarios) => {
      if (err) {
        log.error(err);
      }
      let scenarioPromises = scenarios.map((sc) => {
        return new Promise((scResolve) => {
          Execution.findOne({scenarioId: sc.getScenarioId()}, (err, execution) => {
            sc.projectTag = project.tag;
            if (execution && execution.executions) {
              sc.executions = execution.executions;
            }
            if (this.applyFilter(sc, filter)) {
              filteredScenarios.push(sc);
            }
            scResolve();
          });
        });
      });
      Promise.all(scenarioPromises).then(() => {
        log.info(JSON.stringify(filteredScenarios));
        callback(null, project, filteredScenarios);
      }).catch(log.error);
    });
  });
};

module.exports.applyFiltersToProject = function (projectId, filters, callback) {
  Project.findOne({projectId: projectId}, (err, project) => {
    if (err) {
      log.error(err);
    }
    if (!project) {
      log.error('Failed to find project with id ' + projectId);
    }
    let scenariosScopes = {};
    for (let filter of filters) {
      scenariosScopes[filter.id] = {filter: filter, scenarios: []};
    }
    scenariosScopes['disabled'] = {
      filter: {
        id: 'disabled',
        displayName: 'Disabled',
        description: 'Scenarios that didn\'t pass any filters'
      }, scenarios: []
    };

    Scenario.find({project: project.projectId}, (err, scenarios) => {
      if (err) {
        log.error(err);
      }
      let scenarioPromises = scenarios.map((sc) => {
        return new Promise((scResolve) => {
          Execution.findOne({scenarioId: sc.getScenarioId()}, (err, execution) => {
            sc.projectTag = project.tag;
            if (execution && execution.executions) {
              sc.executions = execution.executions;
            }
            if (sc.executions) {
              sc.executions = sc.executions.slice(Math.max(sc.executions.length - 30, 1));
            }
            let inScopes = false;
            for (let filter of filters) {
              if (this.applyFilter(sc, filter)) {
                scenariosScopes[filter.id].scenarios.push(sc);
                inScopes = true;
              }
            }
            if (!inScopes) {
              scenariosScopes['disabled'].scenarios.push(sc);
            }
            scResolve();
          });
        });
      });
      Promise.all(scenarioPromises).then(() => {
        callback(null, project, scenariosScopes);
      }).catch(log.error);
    });
  });
};

module.exports.applyTags = function(scenario, tags) {
  for (let tag of tags) {
    if (checkProjectTag(scenario, tag)) {
      return true;
    }
  }
  return false;
};

module.exports.applyFilter = function (scenario, filter) {
  let result = true;
  if (filter.executionRules) {
    for (let executionRule of filter.executionRules) {
      result &= validateExecutionRule(scenario, executionRule);
    }
  }
  if (!filter.ignoreProjectTag) {
    result &= checkProjectTag(scenario, scenario.projectTag);
  }
  return result;
};
