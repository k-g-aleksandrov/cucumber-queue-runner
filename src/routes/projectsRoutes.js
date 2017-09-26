import express from 'express';
import { Project, Scenario, Execution } from 'libs/mongoose';
import util from 'libs/util';
import filter from 'libs/filter';
import gherkin from 'gherkin';
import fs from 'fs';

import mapper from 'libs/testrail';

import logTemplate from 'libs/log';
const log = logTemplate(module);

const router = express.Router();

function saveScenarios(scenarios, projectTag, callback) {
  const savePromises = scenarios.map((scenario) => {
    return new Promise((resolve) => {
      const tagsList = [];

      if (scenario.tags) {
        for (const tag of scenario.tags) {
          tagsList.push(tag.name);
        }
      }

      const scenarioDbObject = new Scenario({
        project: scenario.project,
        classpath: scenario.classpath,
        featureName: scenario.featureName,
        scenarioName: scenario.scenarioName,
        scenarioLine: scenario.scenarioLine,
        exampleParams: scenario.exampleParams,
        tags: tagsList,
        executions: []
      });

      Execution.findOne({ scenarioId: `${scenario.featureName} -> ${scenario.scenarioName}(${scenario.exampleParams})` }).exec()
        .then((execution) => {
          if (execution) {
            scenarioDbObject.executions = execution.executions;
          }
          scenarioDbObject.filters = filter.getScenarioFilters(scenarioDbObject, projectTag);
          scenarioDbObject.save()
            .then(() => {
              resolve();
            })
            .catch((err) => {
              if (err.message.indexOf('duplicate key') > -1) {
                log.error(`Failed to save scenario '${scenario.scenarioName}. Error: ${err}`);
                resolve();
              } else {
                throw err;
              }
            });
        })
        .catch((err) => {
          log.error(err);
        });
    });
  });

  Promise.all(savePromises).then(() => {
    callback();
  });
}

/**
 * @api {get} /projects List Projects
 *
 * @apiName List Projects
 * @apiGroup projects
 *
 * @apiSuccess (Success-Response) {object[]} projects[] List of available projects
 * @apiSuccess (Success-Response) {string}   projects.projectId project ID
 * @apiSuccess (Success-Response) {string}   projects.name project name
 * @apiSuccess (Success-Response) {string}   projects.tag Default cucumber tag that will be used to filter project-related scenarios
 * @apiSuccess (Success-Response) {string}   projects.description project description
 * @apiSuccess (Success-Response) {string}   projects.workingCopyPath path to working copy to scan for scenarios
 * @apiSuccess (Success-Response) {bool}     projects.featuresRoot cucumber features root path related to working copy path (e.g. src/test/resources/)
 */
router.get('/', (req, res) => {
  Project.find({}).exec()
    .then((projects) => {
      res.send({ projects });
    })
    .catch((err) => {
      res.send({ error: 'Failed to get projects list from DB', originalError: err });
    });
});

router.get('/testrail-map', (req, res) => {
  res.send(mapper.getCurrentState());
});

router.get('/testrail-map/scan', (req, res) => {
  mapper.rescanTestRailMap();
  res.send(mapper.getCurrentState());
});

router.get('/cleanExecutions', (req, res) => {
  Execution.find({}).exec()
    .then((executions) => {
      const removed = [];

      const executionPromises = executions.map((execution) => {
        return new Promise((execResolve) => {
          const matches = execution.scenarioId.match(/^(.*?)(?: -> )(.*)\(((?::.*:)|(?:null))\)$/);

          if (execution.scenarioId !== `${matches[1]} -> ${matches[2]}(${matches[3]})`) {
            console.log(`Scenario: ${execution.scenarioId}`);
            console.log(`Parsed: ${JSON.stringify(matches)}`);
          } else {
            let searchQuery;

            if (matches[3] === 'null') {
              searchQuery = {
                featureName: matches[1],
                scenarioName: matches[2]
              };
            } else {
              searchQuery = {
                featureName: matches[1],
                scenarioName: matches[2],
                exampleParams: matches[3]
              };
            }

            Scenario.findOne(searchQuery).exec()
              .then((scenario) => {
                if (!scenario) {
                  Execution.findOneAndRemove({ _id: execution._id }).exec()
                    .then(() => {
                      removed.push(`${searchQuery.featureName} -> ${searchQuery.scenarioName}(${searchQuery.exampleParams})`);
                    });
                }
                execResolve();
              });
          }
        });
      });

      Promise.all(executionPromises).then(() => {
        res.send({ success: true, removed });
      }).catch(log.error);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

router.post('/add', (req, res) => {
  const newProject = new Project({
    projectId: req.body.id,
    name: req.body.name,
    tag: req.body.tag,
    description: req.body.description,
    workingCopyPath: req.body.wcpath,
    featuresRoot: req.body.frpath
  });

  newProject.save((err) => {
    if (err) {
      log.error(err);
      return res.status(500).send({ error: err });
    }
    res.redirect('/projects');
  });
});

/**
 * @api {get} /projects/:project/scan Scan Project
 *
 * @apiName Scan Project
 * @apiGroup projects
 *
 * @apiParam {string} projectId project ID
 *
 * @apiSuccess (Success-Response) {object}          project
 * @apiSuccess (Success-Response) {string}       project.projectId project ID
 * @apiSuccess (Success-Response) {number}  project.scenariosCount count of scenarios found
 */
router.get('/:project/scan', (req, res) => {
  if (!req.params.project) {
    return res.status(400).send({ error: 'Project name was not specified' });
  }

  const projectId = req.params.project;

  let featuresRoot;
  let featuresList;
  let scenariosCount = 0;
  let projectTag;

  Project.findOne({ projectId }).exec()
    .then((project) => {
      if (!project) {
        return res.send({ error: `Can\'t find project with id ${projectId}` });
      }

      const workingCopyPath = req.query.path ? req.query.path : project.workingCopyPath;

      if (!workingCopyPath) {
        return res.status(400).send({ error: 'Repository path not set for project' });
      }

      featuresRoot = project.featuresRoot;
      projectTag = project.tag;

      return util.scanRepository(workingCopyPath);
    })
    .then((features) => {
      featuresList = features;
      return Scenario.remove({ project: projectId }).exec();
    })
    .then(() => {
      const featuresScanPromises = featuresList.map((featureFile) => {
        return new Promise((resolve, reject) => {
          const parser = new gherkin.Parser();
          const buf = fs.readFileSync(featureFile, 'utf8');
          const parts = featureFile.split(featuresRoot);
          const classpath = parts.pop();
          const project = projectId;
          const gherkinDocument = parser.parse(buf);
          const feature = gherkinDocument.feature;

          const scenarioObjects = [];

          for (const child of feature.children) {
            if (child.type === 'Background') {
              continue;
            }
            if (child.type === 'ScenarioOutline') {
              const examples = child.examples;

              for (const examplesBlock of examples) {
                for (const example of examplesBlock.tableBody) {
                  let paramsString = ':';

                  for (const exampleParam of example.cells) {
                    paramsString += `${exampleParam.value}:`;
                  }

                  scenarioObjects.push({
                    project,
                    classpath,
                    featureName: feature.name,
                    scenarioName: child.name,
                    scenarioLine: example.location.line,
                    exampleParams: paramsString,
                    tags: child.tags.concat(examplesBlock.tags)
                  });
                }
              }
            } else if (child.type !== 'Background') {
              scenarioObjects.push({
                project,
                classpath,
                featureName: feature.name,
                scenarioName: child.name,
                scenarioLine: child.location.line,
                exampleParams: null,
                tags: child.tags
              });
            }
          }
          saveScenarios(scenarioObjects, projectTag, (saveScenarioError) => {
            scenariosCount += scenarioObjects.length;
            if (saveScenarioError) {
              log.error('Internal error(%d): %s', res.statusCode, saveScenarioError.message);
              res.status(500).send({ error: 'Server error' });
              return reject();
            }
            resolve();
          });
        });
      });

      Promise.all(featuresScanPromises).then(() => {
        return res.send({ project: { projectId, scenariosCount } });
      });
    })
    .catch((err) => {
      log.error(err);
      res.send({ error: err });
    });
});

router.get('/:project', (req, res) => {
  const scenariosScopes = {};

  for (const scenariosFilter of [filter.development, filter.daily, filter.muted, filter.full, filter.disabled]) {
    scenariosScopes[scenariosFilter.id] = { filter: scenariosFilter, scenarios: [] };
  }

  return Project.findOne({ projectId: req.params.project }).exec()
    .then((project) => {
      if (!project) {
        return res.send({
          project: { error: 'no project' }
        });
      }
      res.send({
        project: {
          details: {
            id: project.projectId,
            name: project.name,
            description: project.description,
            tag: project.tag,
            workingCopyPath: project.workingCopyPath
          },
          scopes: scenariosScopes
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/:project/counter', (req, res) => {
  const counters = {};
  const promises = [filter.development, filter.daily, filter.muted, filter.full, filter.disabled].map((filterObject) => {
    return new Promise((resolve) => {
      Scenario.count({ project: req.params.project, filters: { $in: [ filterObject.id ] } }).exec()
        .then((count) => {
          counters[filterObject.id] = count;
          resolve();
        });
    });
  });

  Promise.all(promises).then(() => {
    res.send(counters);
  });
});

router.get('/:project/scenarios', (req, res) => {
  const scenariosScopes = {};

  const filterParam = req.query.filter;
//  const offset = req.query.offset;

  if (filterParam) {
    const scenariosFilter = filter.getFilterByName(filterParam);

    scenariosScopes[scenariosFilter.id] = { filter: scenariosFilter, scenarios: [] };
    /* let */const query = Scenario.find({
      project: req.params.project,
      filters: {
        $in: [
          scenariosScopes[scenariosFilter.id].filter.id
        ]
      }
    }, {
      _id: 0,
      __v: 0,
      classpath: 0,
      exampleParams: 0,
      executions: { $slice: -30 },
      'executions.endTimestamp': 0,
      'executions.startTimestamp': 0,
      'executions._id': 0,
      'executions.executor': 0
    });

//    if (offset) {
//      query = query.limit(100).skip(Number(offset));
//    }
    query.exec()
      .then((scenarios) => {
        scenariosScopes[filterParam].scenarios = scenarios;
        res.send(scenariosScopes);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

/**
 * @api {delete} /projects/:projectId Delete Project
 *
 * @apiName Delete Project
 * @apiGroup projects
 *
 * @apiParam {string} projectId project ID
 *
 * @apiSuccess (Success-Response) {object}  project
 * @apiSuccess (Success-Response) {string}  project.projectId project ID
 * @apiSuccess (Success-Response) {bool}    project.success success flag
 */
router.delete('/:project', (req, res) => {
  Project.findOneAndRemove({ projectId: req.params.project }).exec()
    .then((project) => {
      if (!project) {
        return res.status(404).send({ error: `Project '${req.params.project}' does not exist` });
      }
      res.send({ project: { projectId: req.params.project, success: true } });
    })
    .catch((err) => {
      res.send({ error: `Failed to delete project '${req.params.project}'`, originalError: err });
    });
});

export default router;
