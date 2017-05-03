import express from 'express';
import { Project, Scenario } from 'libs/mongoose';
import util from 'libs/util';
import filter from 'libs/filter';
import gherkin from 'gherkin';
import fs from 'fs';

const log = require('libs/log')(module);

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
  Project.find({}, (projectSearchError, projects) => {
    if (projectSearchError) {
      log.error(projectSearchError);
      res.send({ error: 'project_not_found' });
    }
    res.send({ projects });
  });
});

router.post('/add', (req, res) => {
  log.info('request started');
  const id = req.body.id;
  const name = req.body.name;
  const tag = req.body.tag;
  const description = req.body.description;
  const workingCopyPath = req.body.wcpath;
  const featuresRoot = req.body.frpath;

  const newProject = new Project({
    projectId: id,
    name: name,
    tag: tag,
    description: description,
    workingCopyPath: workingCopyPath,
    featuresRoot: featuresRoot
  });

  newProject.save((err) => {
    if (err) {
      log.error(err);
      res.statusCode = 500;
      return res.send({ error: err });
    }
    res.redirect('/projects');
  });
});

router.get('/:project/scan', (req, res) => {
  if (!req.params.project) {
    res.statusCode = 400;
    return res.send({ error: 'Please specify project name' });
  }

  const projectId = req.params.project;

  Project.findOne({ projectId }, (findProjectError, project) => {
    if (findProjectError) {
      log.error(findProjectError);
      res.send({ error: findProjectError });
    }

    if (!project) {
      return res.send({ error: `Can\'t find project with id ${projectId}` });
    }

    let workingCopyPath = project.workingCopyPath;

    if (req.query.path) {
      log.debug(`Working copy path '${workingCopyPath}' will be overridden by query parameter to '${req.query.path}'`);
      workingCopyPath = req.query.path;
    }
    if (!workingCopyPath) {
      res.statusCode = 400;
      return res.send({ error: 'Repository path should be specified to scan feature files' });
    }

    const featuresRoot = project.featuresRoot;

    util.scanRepository(workingCopyPath, (scanRepositoryError, results) => {
      if (scanRepositoryError) {
        res.statusCode = 400;
        log.error(scanRepositoryError);
        return res.send({ error: `Path not found: ${workingCopyPath}` });
      }

      Scenario.remove({ project: projectId }, (removeScenariosError) => {
        if (removeScenariosError) {
          log.error(removeScenariosError);
        }
        for (const result of results) {
          const parser = new gherkin.Parser();
          const buf = fs.readFileSync(result, 'utf8');
          const parts = result.split(featuresRoot);
          const classpath = parts.pop();
          const project = projectId;
          const gherkinDocument = parser.parse(buf);
          const feature = gherkinDocument.feature;

          log.info(`Parsing feature ${feature.name}`);
          for (const child of feature.children) {
            if (child.type === 'ScenarioOutline') {
              const examples = child.examples;

              for (const examplesBlock of examples) {
                for (const example of examplesBlock.tableBody) {
                  let paramsString = ':';

                  for (const exampleParam of example.cells) {
                    paramsString += `${exampleParam.value}:`;
                  }
                  log.debug(`${feature.name} -> ${child.name}:${example.location.line} (${paramsString})`);
                  const scenarioObject = {
                    project,
                    classpath,
                    featureName: feature.name,
                    scenarioName: child.name,
                    scenarioLine: example.location.line,
                    exampleParams: paramsString,
                    tags: child.tags.concat(examplesBlock.tags)
                  };

                  saveScenario(scenarioObject, (saveScenarioError, data) => {
                    if (saveScenarioError) {
                      if (saveScenarioError.message.indexOf('duplicate key') > -1) {
                        log.debug(`Scenario ${child.name} already exists in DB, skipped`);
                      } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s', res.statusCode, saveScenarioError.message);
                        return res.send({ error: 'Server error' });
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

              saveScenario(scenarioObject, (saveScenarioError, data) => {
                if (saveScenarioError) {
                  if (saveScenarioError.message.indexOf('duplicate key') > -1) {
                    log.debug(`Scenario ${child.name} already exists in DB, skipped`);
                  } else {
                    res.statusCode = 500;
                    log.error(`Internal error(${res.statusCode}): ${saveScenarioError.message}`);
                    return res.send({ error: 'Server error' });
                  }
                }
              });
            }
          }
        }
        res.send(results);
      });
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

export default router;
