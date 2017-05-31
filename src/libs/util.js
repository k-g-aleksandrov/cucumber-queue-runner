import dive from 'dive';
import path from 'path';

import { Scenario, Execution } from 'libs/mongoose';

module.exports.isGitUrl = function isGitUrl(str) {
  const re = /(?:git|ssh|https?|git@[\w.]+):(?:\/\/)?[\w.@:\/~_-]+\.git(?:\/?|#[\d\w.\-_]+?)$/;

  return re.test(str);
};

module.exports.generateGUID = function generateGUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

function recursiveDirectoryScan(filename, dir, callback, complete) {
  const results = [];

  return dive(dir, (err, file) => {
    if (err) {
      return callback(err);
    }

    const condition = filename.constructor.name === 'RegExp'
      ? path.relative(dir, file).match(filename)
      : path.relative(dir, file) === filename;

    if (condition || filename === '*') {
      results.push(file);
      return callback(null, file);
    }
  }, () => {
    return complete(results);
  });
}

module.exports.scanRepository = function scanRepository(directory) {
  return new Promise((resolve) => {
    recursiveDirectoryScan(/src\/.+\/.+\.feature$/, directory, (err) => {
      if (err) {
        console.log(`directory ${directory} not found`);
      }
    }, (results) => {
      return resolve(results);
    });
  });
};

module.exports.zipDirectory = (dir, name) => {
  const execFileSync = require('child_process').execFileSync;

  execFileSync('zip', ['-r', '-j', name, dir]);
};

module.exports.shuffleArray = function shuffleArray(array) {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

module.exports.populateProjectScenarios = function populateProjectScenarios(projectId) {
  Scenario.find({ project: projectId }).exec()
    .then((scenarios) => {
      for (const scenario of scenarios) {
        Execution.findOne({ scenarioId: scenario.getScenarioId() }).exec()
          .then((executions) => {
            if (executions) {
              console.log(`Processing ${JSON.stringify(scenario)} - ${JSON.stringify(executions)}`);
              Scenario.findOneAndUpdate({ _id: scenario._id }, { executions: executions.executions }, (err, doc) => {
                if (err) {
                  console.log(err);
                }
                console.log(`successfully updated ${JSON.stringify(doc)}`);
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
