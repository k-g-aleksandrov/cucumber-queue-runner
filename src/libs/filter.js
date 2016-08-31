'use strict';

let log = require('libs/log')(module);

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
  description: 'All scenarios tagged by project tag'
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

module.exports.applyFilter = function(scenario, filter) {
  let result = true;
  if (filter.executionRules) {
    for (let executionRule of filter.executionRules) {
      let isApplied = validateExecutionRule(scenario, executionRule);
      result &= isApplied;
    }
  }
  if (!filter.ignoreProjectTag) {
    result &= checkProjectTag(scenario, scenario.projectTag);
  }
  return result;
};
