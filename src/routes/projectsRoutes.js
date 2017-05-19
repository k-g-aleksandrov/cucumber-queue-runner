import express from 'express';
import { Project, Scenario } from 'libs/mongoose';
import util from 'libs/util';
import filter from 'libs/filter';
import gherkin from 'gherkin';
import fs from 'fs';

import logTemplate from 'libs/log';
const log = logTemplate(module);

const router = express.Router();

function saveScenario(scenario, callback) {
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
    tags: tagsList
  });

  scenarioDbObject.save(callback);
}

router.get('/', (req, res) => {
  Project.find({}).exec()
    .then((projects) => {
      res.send({ projects });
    })
    .catch((err) => {
      res.send({ error: 'Failed to get projects list from DB', originalError: err });
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

router.get('/:project/scan', (req, res) => {
  if (!req.params.project) {
    return res.status(400).send({ error: 'Project name was not specified' });
  }

  const projectId = req.params.project;

  Project.findOne({ projectId }, (findProjectError, project) => {
    if (findProjectError) {
      log.error(findProjectError);
      res.send({ error: findProjectError });
    }

    if (!project) {
      return res.send({ error: `Project '${projectId}' was not found` });
    }

    const workingCopyPath = req.query.path ? req.query.path : project.workingCopyPath;

    if (!workingCopyPath) {
      return res.status(400).send({ error: 'Repository path not set for project' });
    }

    const featuresRoot = project.featuresRoot;

    util.scanRepository(workingCopyPath)
      .then((features) => {
        Scenario.remove({ project: projectId }, (removeScenariosError) => {
          if (removeScenariosError) {
            log.error(removeScenariosError);
          }
          for (const result of features) {
            const parser = new gherkin.Parser();
            const buf = fs.readFileSync(result, 'utf8');
            const parts = result.split(featuresRoot);
            const classpath = parts.pop();
            const project = projectId;
            const gherkinDocument = parser.parse(buf);
            const feature = gherkinDocument.feature;

            for (const child of feature.children) {
              if (child.type === 'ScenarioOutline') {
                const examples = child.examples;

                for (const examplesBlock of examples) {
                  for (const example of examplesBlock.tableBody) {
                    let paramsString = ':';

                    for (const exampleParam of example.cells) {
                      paramsString += `${exampleParam.value}:`;
                    }
                    const scenarioObject = {
                      project,
                      classpath,
                      featureName: feature.name,
                      scenarioName: child.name,
                      scenarioLine: example.location.line,
                      exampleParams: paramsString,
                      tags: child.tags.concat(examplesBlock.tags)
                    };

                    saveScenario(scenarioObject, (saveScenarioError) => {
                      if (saveScenarioError) {
                        if (saveScenarioError.message.indexOf('duplicate key') > -1) {
                          log.debug(`Scenario ${child.name} already exists in DB, skipped`);
                        } else {
                          log.error('Internal error(%d): %s', res.statusCode, saveScenarioError.message);
                          return res.status(500).send({ error: 'Server error' });
                        }
                      }
                    });
                  }
                }
              } else if (child.type !== 'Background') {
                const scenarioObject = {
                  project,
                  classpath,
                  featureName: feature.name,
                  scenarioName: child.name,
                  scenarioLine: child.location.line,
                  exampleParams: null,
                  tags: child.tags
                };

                saveScenario(scenarioObject, (saveScenarioError) => {
                  if (saveScenarioError) {
                    if (saveScenarioError.message.indexOf('duplicate key') > -1) {
                      log.debug(`Scenario ${child.name} already exists in DB, skipped`);
                    } else {
                      log.error(`Internal error(${res.statusCode}): ${saveScenarioError.message}`);
                      return res.status(500).send({ error: 'Server error' });
                    }
                  }
                });
              }
            }
          }
          res.send({ project: { projectId, features } });
        });
      })
      .catch((err) => {
        if (err) {
          log.error(err);
          return res.status(400).send({ error: `Path not found: ${workingCopyPath}` });
        }
      });
  });
});

router.get('/:project', (req, res) => {
  const scenarioFilters = [filter.development, filter.daily, filter.muted, filter.full];

  filter.applyFiltersToProject(req.params.project, scenarioFilters, (applyFiltersError, project, scenariosScopes) => {
    if (applyFiltersError) {
      throw applyFiltersError;
    }
    res.send({
      project: {
        id: project.projectId,
        name: project.name,
        description: project.description,
        scopes: scenariosScopes
      }
    });
  });
});

/**
 * Delete project by specified project ID
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
