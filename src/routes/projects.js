'use strict';

let log = require('libs/log')(module);

let Project = require('libs/mongoose').Project;
let Scenario = require('libs/mongoose').Scenario;

let fs = require('fs');
let util = require('libs/util');
var gherkin = require('gherkin');

let filter = require('libs/filter');

let express = require('express');
let router = express.Router();


function saveScenario(project, classpath, featureName, scenarioName, scenarioLine, exampleParams, tags, callback) {
  let tagsList = [];
  if (tags) {
    for (let tag of tags) {
      tagsList.push(tag.name);
    }
  }

  var scenario = new Scenario({
    project: project,
    classpath: classpath,
    featureName: featureName,
    scenarioName: scenarioName,
    scenarioLine: scenarioLine,
    exampleParams: exampleParams,
    tags: tagsList
  });

  scenario.save(callback);
}

router.get('/', (req, res) => {
  Project.find({}, (err, projects) => {
    res.render('projects', {projects: projects});
  });
});

router.post('/add', (req, res) => {
  let id = req.body.id;
  let name = req.body.name;
  let tag = req.body.tag;
  let description = req.body.description;
  let workingCopyPath = req.body.wcpath;
  let featuresRoot = req.body.frpath;

  let newProject = new Project({
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
      return res.send({error: err});
    }
    res.redirect('/projects');
  });
});

router.get('/:project/scan', (req, res) => {
  if (!req.params.project) {
    res.statusCode = 400;
    return res.send({error: 'Please specify project name'});
  }
  let projectId = req.params.project;
  Project.findOne({projectId: projectId}, (err, project) => {
    if (err) {
      log.error(err);
      res.send({error: err});
    }

    if (!project) {
      return res.send({error: 'Can\'t find project with id ' + projectId});
    }
    let projectId = project.projectId;
    let workingCopyPath = project.workingCopyPath;
    if (req.query.path) {
      log.debug('Working copy path \'' + workingCopyPath + '\' will be overridden by query parameter to \'' +
        req.query.path + '\'');
      workingCopyPath = req.query.path;
    }
    let featuresRoot = project.featuresRoot;
    if (!workingCopyPath) {
      res.statusCode = 400;
      return res.send({error: 'Repository path should be specified to scan feature files'});
    }
    util.scanRepository(workingCopyPath, (err, results) => {
      if (err) {
        res.statusCode = 400;
        log.error(err);
        return res.send({error: 'Path not found: ' + workingCopyPath});
      }

      Scenario.remove({project: projectId}, function (err) {
        if (err) {
          log.error(err);
        }
        for (let result of results) {
          var parser = new gherkin.Parser();
          var buf = fs.readFileSync(result, 'utf8');
          let parts = result.split(featuresRoot);
          var classpath = parts.pop();
          let project = projectId;
          var gherkinDocument = parser.parse(buf);
          var feature = gherkinDocument.feature;
          log.info(`Parsing feature ${feature.name}`);
          for (let child of feature.children) {
            if (child.type === 'ScenarioOutline') {
              var examples = child.examples[0];
              for (let example of examples.tableBody) {
                let paramsString = ':';
                for (let exampleParam of example.cells) {
                  paramsString += exampleParam.value + ':';
                }
                log.debug(feature.name + ' -> ' + child.name + ':' + example.location.line + ' (' + paramsString + ')');
                saveScenario(project, classpath, feature.name, child.name, example.location.line, paramsString, child.tags, (err, data) => {
                  if (err) {
                    if (err.message.indexOf('duplicate key') > -1) {
                      log.debug('Scenario ' + child.name
                        + ' already exists in DB, skipped');
                    } else {
                      res.statusCode = 500;
                      log.error('Internal error(%d): %s', res.statusCode, err.message);
                      return res.send({error: 'Server error'});
                    }
                  }
                });
              }
            } else if (child.type !== 'Background') {
              saveScenario(project, classpath, feature.name, child.name, child.location.line, null, child.tags, (err, data) => {
                if (err) {
                  if (err.message.indexOf('duplicate key') > -1) {
                    log.debug('Scenario ' + child.name
                      + ' already exists in DB, skipped');
                  } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s', res.statusCode, err.message);
                    return res.send({error: 'Server error'});
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
  let scenarioFilters = [filter.development, filter.daily, filter.muted, filter.full];
  let scenariosScopes = {};
  for (let scenarioFilter of scenarioFilters) {
    scenariosScopes[scenarioFilter.id] = {filter: scenarioFilter, scenarios: []};
  }
  filter.applyFiltersToProject(req.params.project, scenarioFilters, (err, project, scenariosScopes) => {
    res.render('project', {
      id: project.projectId,
      name: project.name,
      description: project.description,
      scopes: scenariosScopes
    });
  });
});

module.exports = router;
