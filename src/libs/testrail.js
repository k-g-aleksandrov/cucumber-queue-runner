import fetch from 'node-fetch';

import { TestRailMap, Scenario } from 'libs/mongoose';

import config from 'config';

class TestRailMapper {

  constructor() {
    this.mapperState = TestRailMapper.STATE_IDLE;
    this.testRailMap = {};
    TestRailMap.findOne({}, { __v:0, _id: 0 }).limit(1).exec()
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
      .then((featuresToTestRailMap) => {
        this.testRailMap.featuresToTestRailMap = featuresToTestRailMap;
        this.testRailMap.mappingDate = new Date();
        this.mapperState = TestRailMapper.STATE_IDLE;
        console.log('Testrail Map: done mapping');
        const map = new TestRailMap({
          mappingDate: this.testRailMap.mappingDate,
          featuresToTestRailMap: this.testRailMap.featuresToTestRailMap,
          testRailToFeaturesMap: this.testRailMap.testRailToFeaturesMap
        });

        map.save()
          .then(() => {
            console.log('TestRail Map: saved object to DB');
          });
      });
  }

  compareFeaturesWithTestRail(suitesList, sectionsList, casesList) {
    return new Promise((resolve) => {
      const reverseMap = {};

      Scenario.find({}, {
        executions: 0,
        __v:0,
        _id: 0,
        classpath:0
      }).exec()
        .then((scenarios) => {
          console.log('TestRail Map: received list of scenarios');
          for (let scenario of scenarios) {
            scenario = scenario.toObject();

            console.log(`Processing ${scenario.scenarioName}`);
            if (!reverseMap[scenario.project]) {
              reverseMap[scenario.project] = { name: scenario.project, features: {} };
            }
            if (!reverseMap[scenario.project].features[scenario.featureName]) {
              reverseMap[scenario.project].features[scenario.featureName] = { name: scenario.featureName, scenarios: {} };
            }
            scenario.testCases = [];
            for (const tag of scenario.tags.filter((t) => t.startsWith('@id'))) {
              const testCase = casesList[tag.replace('@id', '')];

              if (testCase) {
                scenario.testCases.push(testCase);
              }
            }
            reverseMap[scenario.project]
                    .features[scenario.featureName]
                    .scenarios[scenario.scenarioName.replace(/\./g, '_')] = scenario;
          }
          resolve(reverseMap);
        })
        .catch((err) => {
          console.log(err);
          resolve({});
        });
    });
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
