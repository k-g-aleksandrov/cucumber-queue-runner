import fetch from 'node-fetch';

import { TestRailMap, Scenario } from 'libs/mongoose';

import config from 'config';

import stringSimilarity from 'string-similarity';

import Diff from 'text-diff';

class TestRailMapper {

  constructor() {
    this.mapperState = TestRailMapper.STATE_IDLE;
    this.testRailMap = {};
    TestRailMap.findOne({}, { __v:0, _id: 0 }).exec()
      .then((testRailMap) => {
        if (testRailMap) {
          this.testRailMap = testRailMap.toObject();
        }
      });
  }

  rescanTestRailMap() {
    if (this.mapperState !== TestRailMapper.STATE_IDLE) {
      console.log('Mapping already started.');
      return;
    }
    this.mapperState = TestRailMap.STATE_STARTED;
    console.log('Testrail Map: scan started...');
    let suitesList;
    let sectionsList;
    let casesList;

    this.getTestRailSuites()
      .then((suitesListTemp) => {
        console.log('Testrail Map: loading suites');
        this.mapperState = TestRailMapper.STATE_TESTRAIL_GET_SUITES;
        suitesList = suitesListTemp;
        return this.getTestRailSections(suitesList);
      })
      .then((sectionsListTemp) => {
        console.log('Testrail Map: loading sections');
        sectionsList = sectionsListTemp;
        return this.getTestRailCases(suitesList);
      })
      .then((casesListTemp) => {
        console.log('Testrail Map: loading cases');
        this.mapperState = TestRailMapper.STATE_TESTRAIL_GET_CASES;
        casesList = casesListTemp;
        for (const caseId of Object.keys(casesList)) {
          const testCase = casesList[caseId];

          testCase.suite = suitesList[testCase.suite_id].name;
          testCase.section = sectionsList[testCase.section_id].name;
        }
        console.log('Testrail Map: mapping scenarios');
        this.mapperState = TestRailMapper.STATE_COMPARISON;
        return this.compareWithFeatures(suitesList, sectionsList, casesList);
      })
      .then((testRailToFeaturesMap) => {
        this.testRailMap.testRailToFeaturesMap = testRailToFeaturesMap;
        console.log('Testrail Map: reverse mapping');
        return this.compareFeaturesWithTestRail(suitesList, sectionsList, casesList);
      })
      .then((array) => {
        this.testRailMap.featuresToTestRailMap = array[0];
        this.testRailMap.sortedBySimilarity = array[1];
        this.testRailMap.mappingDate = new Date();
        this.mapperState = TestRailMapper.STATE_IDLE;
        console.log('Testrail Map: done mapping');
        const map = new TestRailMap({
          mappingDate: this.testRailMap.mappingDate,
          featuresToTestRailMap: this.testRailMap.featuresToTestRailMap,
          testRailToFeaturesMap: this.testRailMap.testRailToFeaturesMap,
          sortedBySimilarity: this.testRailMap.sortedBySimilarity
        });

        TestRailMap.remove({}).exec()
          .then(() => {
            return map.save();
          })
          .then(() => {
            console.log('TestRail Map: saved object to DB');
          })
          .catch((err) => {
            console.log(`Failed to save scan result. Error: ${err}`);
          });
      });
  }

  compareFeaturesWithTestRail(suitesList, sectionsList, casesList) {
    return new Promise((resolve) => {
      const reverseMap = {};

      Scenario.find({ scenarioName : { $exists: true } }, {
        executions: 0,
        __v:0,
        _id: 0,
        classpath:0
      }).exec()
        .then((scenarios) => {
          console.log('TestRail Map: received list of scenarios');
          for (let scenario of scenarios) {
            scenario = scenario.toObject();

            if (!reverseMap[scenario.project]) {
              reverseMap[scenario.project] = { name: scenario.project, features: {} };
            }
            if (!reverseMap[scenario.project].features[scenario.featureName]) {
              reverseMap[scenario.project].features[scenario.featureName] = { name: scenario.featureName, scenarios: {} };
            }
            const idTags = scenario.tags.filter((t) => t.startsWith('@id')).map((t) => t.replace('@id', ''));

            if (idTags.length === 0) {
              scenario.noTagsWarning = true;
            } else {
              for (const idTag of idTags) {
                const testCase = casesList[idTag];

                if (testCase) {
                  if (!scenario.testCases) {
                    scenario.testCases = [];
                  }
                  scenario.testCases.push(testCase);
                } else {
                  if (!scenario.incorrectTags) {
                    scenario.incorrectTags = [];
                  }
                  scenario.incorrectTags.push(`C${idTag}`);
                }
              }
            }

            let similarity = 1;

            if (scenario.incorrectTags) {
              similarity = 0;
            } else if (scenario.testCases) {
              const titleSum = scenario.testCases.map((tc) => tc.title).join(' + ');

              const currentSimilarity = stringSimilarity.compareTwoStrings(scenario.scenarioName, titleSum);

              if (currentSimilarity < similarity) {
                similarity = currentSimilarity;
                const html = this.getDiffHtml(scenario.scenarioName, titleSum);

                scenario.scenarioNameDiff = this.removeTag(html, 'del');
                scenario.testCaseTitleDiff = this.removeTag(html, 'ins');
              }
            }
            scenario.similarity = similarity;

            if (scenario.noTagsWarning) {
              // set similarity > 1 for sorting purposes
              scenario.similarity = 2;
            }

            reverseMap[scenario.project]
                    .features[scenario.featureName]
                    .scenarios[scenario.scenarioName.replace(/\./g, '_')] = scenario;
          }

          const similarityList = [];

          for (const projectId of Object.keys(reverseMap)) {
            const project = reverseMap[projectId];

            for (const featureId of Object.keys(project.features)) {
              const feature = project.features[featureId];

              for (const scenarioId of Object.keys(feature.scenarios)) {
                similarityList.push(feature.scenarios[scenarioId]);
              }
            }
            similarityList.sort((a, b) => {
              return a.similarity - b.similarity;
            });
          }
          resolve([reverseMap, similarityList]);
        })
        .catch((err) => {
          console.log(err);
          resolve({});
        });
    });
  }

  removeTag(str, tag) {
    return str.replace(new RegExp(`<${tag}>(.*?)</${tag}>`, 'g'), '');
  }

  getDiffHtml(scName, tcName) {
    const diff = new Diff();
    const textDiff = diff.main(tcName, scName);

    diff.cleanupSemantic(textDiff);
    return diff.prettyHtml(textDiff);
  }

  compareWithFeatures(suitesList, sectionsList, casesList) {
    return new Promise((resolve) => {
      const testRailMap = {};

      const casePromises = Object.keys(casesList).map((testCaseId) => {
        return new Promise((caseResolve) => {
          const testCase = casesList[testCaseId];

          Scenario.find({
            tags: { $in:[ `@id${testCase.id}` ] }
          },
            {
              executions: 0,
              __v:0,
              _id: 0,
              classpath:0
            }).exec()
          .then((scenarios) => {
            testCase.scenarios = scenarios;
            caseResolve();
          });
        });
      });

      Promise.all(casePromises).then(() => {
        for (const testCaseId of Object.keys(casesList)) {
          const testCase = casesList[testCaseId];

          if (!testRailMap[testCase.suite]) {
            testRailMap[testCase.suite] = { ...suitesList[testCase.suite_id], sections: {} };
          }
          if (!testRailMap[testCase.suite].sections[testCase.section.replace(/\./g, '_')]) {
            testRailMap[testCase.suite]
                  .sections[testCase.section.replace(/\./g, '_')] = { ...sectionsList[testCase.section_id], cases: {} };
          }

          let similarity = 1;

          for (const scenario of testCase.scenarios) {
            const currentSimilarity = stringSimilarity.compareTwoStrings(testCase.title, scenario.scenarioName);

            similarity = currentSimilarity < similarity ? currentSimilarity : similarity;
          }

          testCase.similarity = similarity;

          testRailMap[testCase.suite]
                  .sections[testCase.section.replace(/\./g, '_')].cases[testCase.title.replace(/\./g, '_')] = testCase;
        }
        resolve(testRailMap);
      });
    });
  }

  getTestRailSuites() {
    return new Promise((resolve) => {
      fetch(`https://${config.get('testrail:url')}/index.php?/api/v2/get_suites/${TestRailMapper.PROJECT_ID}`,
        {
          method: 'GET',
          headers: {
            'Authorization': TestRailMapper.AUTHORIZATION_STRING,
            'Content-Type': 'application/json'
          }
        })
        .then((res) => {
          return res.json();
        })
        .then((suites) => {
          const suitesList = {};

          for (const suite of suites) {
            suitesList[suite.id] = { id: suite.id, name: suite.name, url: suite.url };
          }
          resolve(suitesList);
        });
    }).catch((err) => {
      console.log(err);
    });
  }

  getTestRailSections(suitesList) {
    return new Promise((scanResolve) => {
      const sectionsList = {};
      const promises = Object.keys(suitesList).map((suiteId) => {
        const suite = suitesList[suiteId];

        return new Promise((suiteResolve) => {
          fetch(`https://${config.get('testrail:url')}/index.php?/api/v2/get_sections/${TestRailMapper.PROJECT_ID}&suite_id=${suiteId}`,
            {
              method: 'GET',
              headers: {
                'Authorization': TestRailMapper.AUTHORIZATION_STRING,
                'Content-Type': 'application/json'
              }
            })
            .then((res) => {
              return res.json();
            })
            .then((sections) => {
              for (const section of sections) {
                sectionsList[section.id] = {
                  id: section.id,
                  suiteId: section.suite_id,
                  name: section.name,
                  parentId: section.parent_id
                };
              }
              suiteResolve();
            })
            .catch((err) => {
              suite.error = { error: err };
              console.log(err);
              suiteResolve();
            });
        });
      });

      Promise.all(promises).then(() => {
        for (const sectionId of Object.keys(sectionsList)) {
          const section = sectionsList[sectionId];

          if (section.parentId) {
            section.name = `${sectionsList[section.parentId].name} -> ${section.name}`;
          }
          delete section.parentId;
        }
        scanResolve(sectionsList);
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  getTestRailCases(suitesList) {
    return new Promise((scanResolve) => {
      const casesList = {};
      const promises = Object.keys(suitesList).map((suiteId) => {
        const suite = suitesList[suiteId];

        return new Promise((sectionResolve) => {
          fetch(`https://${config.get('testrail:url')}/index.php?/api/v2/get_cases/${TestRailMapper.PROJECT_ID}&suite_id=${suite.id}`,
            {
              method: 'GET',
              headers: {
                'Authorization': TestRailMapper.AUTHORIZATION_STRING,
                'Content-Type': 'application/json'
              }
            })
            .then((res) => {
              return res.json();
            })
            .then((cases) => {
              for (const testCase of cases) {
                delete testCase.created_by;
                delete testCase.created_on;
                delete testCase.updated_by;
                delete testCase.updated_on;
                delete testCase.custom_automated;
                delete testCase.custom_steps;
                delete testCase.custom_preconds;
                delete testCase.custom_steps_separated;
                delete testCase.custom_automute;
                delete testCase.custom_expected;
                delete testCase.estimate_forecast;
                delete testCase.milestone_id;
                delete testCase.priority_id;
                delete testCase.estimate;
                delete testCase.refs;
                delete testCase.type_id;
                delete testCase.template_id;

                casesList[testCase.id] = testCase;
              }
              sectionResolve();
            })
            .catch((err) => {
              suite.error = { error: err };
              console.log(err);
              sectionResolve();
            });
        });
      });

      Promise.all(promises).then(() => {
        scanResolve(casesList);
      });
    });
  }

  getCurrentState() {
    return {
      state: this.mapperState,
      testRailUrl: config.get('testrail:url'),
      ...this.testRailMap
    };
  }
}

TestRailMapper.STATE_IDLE = 'idle';
TestRailMapper.STATE_STARTED = 'started';
TestRailMapper.STATE_TESTRAIL_GET_SUITES = 'testrail_get_suites';
TestRailMapper.STATE_TESTRAIL_GET_CASES = 'testrail_get_cases';
TestRailMapper.STATE_COMPARISON = 'comparison';

TestRailMapper.AUTHORIZATION_STRING =
        `Basic ${new Buffer(`${config.get('testrail:login')}:${config.get('testrail:password')}`).toString('base64')}`;

TestRailMapper.PROJECT_ID = config.get('testrail:projectId');

TestRailMapper.mapper = new TestRailMapper();

module.exports = TestRailMapper.mapper;
