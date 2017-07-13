import logTemplate from 'libs/log';
const log = logTemplate(module);

const Project = require('libs/mongoose').Project;
const Scenario = require('libs/mongoose').Scenario;
const Execution = require('libs/mongoose').Execution;

module.exports.development = {
  id: 'dev',
  displayName: 'Development',
  executionRules: [
    {
      result: 'passed',
      number: 5,
      mode: 'row',
      inverted: true
    }
  ],
  description: 'Have less than 5 passed executions in a row',
  chartColor: '#F5F28F'
};

module.exports.daily = {
  id: 'daily',
  displayName: 'Daily',
  executionRules: [
    {
      result: 'passed',
      number: 5,
      mode: 'row',
      inverted: false
    }, {
      result: 'passed',
      number: 1,
      mode: 'last',
      inverted: false
    }
  ],
  description: 'Have at least 5 passed executions in a row, and passed last execution',
  chartColor: '#92DD96'
};

module.exports.muted = {
  id: 'muted',
  displayName: 'Failed',
  executionRules: [
    {
      result: 'passed',
      number: 5,
      mode: 'row',
      inverted: false
    }, {
      result: 'passed',
      number: 1,
      mode: 'last',
      inverted: true
    }
  ],
  description: 'Have at least 5 passed executions in a row, and failed last execution',
  chartColor: '#F2928C'
};

module.exports.full = {
  id: 'full',
  displayName: 'Full Scope',
  description: 'All scenarios tagged by project tag',
  ignoreProjectTag: false,
  hideInUi: true
};

module.exports.disabled = {
  id: 'disabled',
  displayName: 'Disabled',
  description: 'Scenarios that didn\'t pass any filters',
  chartColor: 'lightgray'
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
    for (const exec of scenario.executions) {
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
      if (scenario.executions[i].result === rule.result) {
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
  }
  return true;
}

function checkProjectTag(scenario, projectTag) {
  return scenario.tags && scenario.tags.indexOf(projectTag) >= 0;
}

module.exports.getFilterByName = function getFilterByName(filter) {
  if (filter === 'full') {
    return this.full;
  } else if (filter === 'dev') {
    return this.development;
  } else if (filter === 'failed' || filter === 'muted') {
    return this.muted;
  } else if (filter === 'daily') {
    return this.daily;
  } else if (filter === 'disabled') {
    return this.disabled;
  } else if (filter === 'custom') {
    return this.custom;
  }
};

module.exports.applyCustomFilterToProject = function applyCustomFilterToProject(projectId, tags, callback) {
  Project.findOne({ projectId }, (projectSearchError, project) => {
    if (projectSearchError) {
      log.error(projectSearchError);
    }
    if (!project) {
      log.error(`Failed to find project with id ${projectId}`);
    }

    const filteredScenarios = [];

    Scenario.find({ project: project.projectId }, (err, scenarios) => {
      if (err) {
        log.error(err);
      }
      const scenarioPromises = scenarios.map((sc) => {
        return new Promise((scResolve) => {
          Execution.findOne({ scenarioId: sc.getScenarioId() }, (executionSearchError, execution) => {
            if (executionSearchError) {
              log.error(executionSearchError);
            }
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
        callback(null, project, filteredScenarios);
      }).catch(log.error);
    });
  });
};

module.exports.applyTags = function applyTags(scenario, tags) {
  for (const tag of tags) {
    if (checkProjectTag(scenario, tag)) {
      return true;
    }
  }
  return false;
};

module.exports.getScenarioFilters = function getScenarioFilters(scenario, projectTag) {
  const filters = [this.full, this.development, this.daily, this.muted];

  const appliedFilters = [];

  for (const filter of filters) {
    let result = true;

    if (filter.executionRules) {
      for (const executionRule of filter.executionRules) {
        result = result && validateExecutionRule(scenario, executionRule);
      }
    }
    if (projectTag && !filter.ignoreProjectTag) {
      result = result && checkProjectTag(scenario, projectTag);
    }
    if (result) {
      appliedFilters.push(filter.id);
    }
  }

  if (appliedFilters.length === 0) {
    appliedFilters.push('disabled');
  }
  return appliedFilters;
};
