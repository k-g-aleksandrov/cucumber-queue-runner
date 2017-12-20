import config from 'config';
import cron from 'node-cron';
import dateFormat from 'date-format';
import cheerio from 'cheerio';

import { Project, DashboardCoverage, SessionHistory } from 'libs/mongoose';

class DashboardDataCollector {
  constructor() {
    if (!instance) {
      instance = this;
    }

    this.coverageTask = cron.schedule('*/5 * * * *', () => {
      this.trackCoverage();
    });

    this.trackEnvironment();
//    this.environmentTask = cron.schedule('*/1 * * * *', () => {
//      this.trackEnvironment();
//    });

    return instance;
  }

  trackCoverage() {
    Project.find({}).exec()
        .then((projects) => {
          for (const project of projects) {
            if (!project.disableCoverageTrack) {
              fetch(`https://${DashboardDataCollector.TESTRAIL_URL}/index.php?/api/v2/get_plans/${DashboardDataCollector.PROJECT_ID}`,
                {
                  method: 'GET',
                  headers: {
                    'Authorization': DashboardDataCollector.AUTHORIZATION_STRING,
                    'Content-Type': 'application/json'
                  }
                })
                .then((res) => {
                  return res.json();
                })
                .then((plans) => {
                  let planName;

                  if (project.projectId === 'web-testing') {
                    planName = `DAILY_WEB_RUN_${dateFormat('dd.MM.yyyy', new Date())}`;
                  } else if (project.projectId === 'ios-testing') {
                    planName = `DAILY_IOS_RUN_${dateFormat('dd.MM.yyyy', new Date())}`;
                  } else {
                    return;
                  }

                  const currentPlan = plans.filter((plan) => {
                    return plan.name === planName;
                  })[0];

                  if (!currentPlan) {
                    return;
                  }

                  DashboardCoverage.update({
                    date: new Date().setHours(0, 0, 0, 0),
                    project: project.projectId
                  },
                    { $set: {
                      date: new Date().setHours(0, 0, 0, 0),
                      project: project.projectId,
                      passed: currentPlan.passed_count,
                      failed: currentPlan.failed_count,
                      retest: currentPlan.retest_count,
                      blocked: currentPlan.blocked_count,
                      untested: currentPlan.untested_count
                    } },
                    { upsert: true }
                  ).exec()
                    .then((err) => {
                      if (err) {
                        console.log(err);
                      }
                    });
                });
            }
          }
        })
        .catch((err) => {
          console.log({ error: 'Failed to get projects list from DB', originalError: err });
        });
  }

  trackEnvironment() {
    fetch(`${DashboardDataCollector.SELENIUM_HUB_URL}/grid/console`)
      .then((res) => {
        return res.text();
      })
      .then((text) => {
        const html = cheerio.load(text);
        const nodes = [];

        const val = html('div.proxy').each((i, elem) => {
          const node = {};
          const version = html('.proxyname', elem).text().match(/(\d+.\d+.\d+)/);
          const id = html('.proxyid', elem).text().match(/id\s:\s(.*?):\/\/(.*?):(.*?),\sOS\s:\s(.*?)/);
          const configEntries = html('div[type=\'config\'] p', elem);

          node.version = version ? version[1] : null;
          node.url = {};
          node.url.protocol = id ? id[1] : null;
          node.url.ip = id ? id[2] : null;
          node.url.port = id ? id[3] : null;
          node.os = id ? id[4] : null;

          node.config = {};
          node.browsers = [];
          configEntries.each((entryIndex, entry) => {
            const configText = html(entry).text();
            const key = configText.substring(0, configText.indexOf(':'));
            const value = configText.substring(configText.indexOf(':') + 1).trim();

            if (key === 'capabilities') {
              const browserDetails = {};
              const browserName = value.match(/.*browserName: (.*?),/);
              const browserInstances = value.match(/.*maxInstances: (\d+?)/);

              browserDetails.name = browserName ? browserName[1] : null;
              browserDetails.instances = browserInstances ? browserInstances[1] : 1;
              node.browsers.push(browserDetails);
            }
//            if (!node.config[key]) {
//              node.config[key] = [];
//            }
//            node.config[key].push(value);
          });

          nodes.push(node);
        });
        return Promise.resolve(nodes);
      })

      .then((nodes) => {
        nodes.forEach((node) => {
          console.log(node);
        });
      });
  }

  parseSeleniumNodes() {

  }

  getEnvironment() {

  }

  getCoverage() {
    return new Promise((resolve) => {
      DashboardCoverage.find().exec()
        .then((data) => {
          const result = {};

          for (const entry of data) {
            if (!result[entry.project]) {
              result[entry.project] = [];
            }
            result[entry.project].push(entry);
          }
          resolve(result);
        });
    });
  }

  getExecutionStatus() {
    SessionHistory.find({ 'details.project': 'ios-testing', 'details.scenariosFilter.scope': 'daily' }).exec()
      .then((history) => {
        console.log(history.length);
        console.log(history[0].details.scenariosFilter);
      });
  }

  stop() {
    this.coverageTask.stop();
    this.environmentTask.stop();
  }
}

let instance = null;

DashboardDataCollector.TESTRAIL_URL = config.get('testrail:url');
DashboardDataCollector.AUTHORIZATION_STRING =
        `Basic ${new Buffer(`${config.get('testrail:login')}:${config.get('testrail:password')}`).toString('base64')}`;

DashboardDataCollector.PROJECT_ID = config.get('testrail:projectId');

DashboardDataCollector.SELENIUM_HUB_URL = config.get('seleniumHubUrl');

export default DashboardDataCollector;
