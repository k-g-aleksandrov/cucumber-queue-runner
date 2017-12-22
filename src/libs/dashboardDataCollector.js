import config from 'config';
import cron from 'node-cron';
import dateFormat from 'date-format';
import cheerio from 'cheerio';

import { exec } from 'child_process';

import { Project, DashboardCoverage, DashboardSeleniumNode } from 'libs/mongoose';

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

  trackEnvironment() {
    this.fetchSeleniumNodes();
  }

  fetchSeleniumNodes() {
    DashboardSeleniumNode.remove({}).exec();
    fetch(`${DashboardDataCollector.SELENIUM_HUB_URL}/grid/console`)
      .then((res) => {
        return res.text();
      })
      .then((text) => {
        return this.parseGridConsole(text);
      })
      .then((nodes) => {
        nodes.forEach((node) => {
          const resultNode = Object.assign({}, node, { system: {} });

          let nodeCredentials;

          this.fetchSeleniumNodeCredentials(node)
            .then((credentials) => {
              nodeCredentials = credentials;
              resultNode.platform = credentials.PLATFORM;
            })
            .then(() => {
              return this.fetchDiskSpace(node, nodeCredentials);
            })
            .then((space) => {
              resultNode.system.space = space;
            })
            .then(() => {
              return this.fetchChromeVersion(node, nodeCredentials);
            })
            .then((chrome) => {
              if (resultNode.browsers.chrome) {
                resultNode.browsers.chrome.browserVersion = chrome;
              }
            })
            .then(() => {
              return this.fetchChromeDriverVersion(node, nodeCredentials);
            })
            .then((chromeDriver) => {
              if (resultNode.browsers.chrome) {
                resultNode.browsers.chrome.driverVersion = chromeDriver;
              }
            })
            .then(() => {
              return this.fetchFirefoxVersion(node, nodeCredentials);
            })
            .then((firefox) => {
              if (resultNode.browsers.firefox) {
                resultNode.browsers.firefox.browserVersion = firefox;
              }
            })
            .then(() => {
              return this.fetchOutdatedPackages(node, nodeCredentials);
            })
            .then((packages) => {
              resultNode.system.outdatedPackages = packages;
              new DashboardSeleniumNode(resultNode).save();
            })
            .then(() => {
              console.log('saved');
            });
        });
      });
  }

  parseGridConsole(console) {
    const html = cheerio.load(console);
    const nodes = [];

    html('div.proxy').each((i, elem) => {
      const version = html('.proxyname', elem).text().match(/(\d+.\d+.\d+)/);
      const id = html('.proxyid', elem).text().match(/id\s:\s(.*?):\/\/(.*?):(.*?),\sOS\s:\s(.*?)/);
      const configEntries = html('div[type=\'config\'] p', elem);

      const node = {
        version: version ? version[1] : null,
        url: {
          protocol: id ? id[1] : null,
          ip: id ? id[2] : null,
          port: id ? id[3] : null
        },
        platform: id ? id[4] : null
      };

      node.config = {};
      node.browsers = {};
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
          node.browsers[browserDetails.name] = browserDetails;
        }
//            if (!node.config[key]) {
//              node.config[key] = [];
//            }
//            node.config[key].push(value);
      });

      nodes.push(node);
    });

    return Promise.resolve(nodes);
  }

  fetchSeleniumNodeCredentials(node) {
    return new Promise((resolve) => {
      fetch(`${node.url.protocol}://${node.url.ip}:${node.url.port}/extra/AdvancedDetailsServlet`)
        .then((res) => {
          return res.json();
        })
        .then((details) => {
          resolve(details);
        });
    });
  }

  fetchDiskSpace(node, credentials) {
    if (credentials.PLATFORM !== 'WINDOWS') {
      return this.runCommand(`sshpass -p ${credentials.TEST_PASSWORD} `
        + `ssh -o StrictHostKeyChecking=no ${credentials.TEST_USER}@${node.url.ip} `
        + '\'df -Ph\'', [])
        .then((response) => {
          const split = response.split(/[\n]+/)
            .filter(e => e.length > 0);

          if (split.length === 0) {
            console.log(response);
            return { message: `no result for node ${node.url.ip}` };
          }

          const rootDetails = split.map(e => e.split(/[\s]+/))
            .filter(e => e[e.length - 1] === '/')[0];

          return {
            total: rootDetails[1],
            used: rootDetails[2],
            free: rootDetails[3],
            usedPercentage: rootDetails[4]
          };
        });
    }
    return Promise.resolve({ message: 'windows not implemented yet' });
  }

  fetchChromeVersion(node, credentials) {
    if (credentials.PLATFORM !== 'WINDOWS') {
      return this.runCommand(`sshpass -p ${credentials.TEST_PASSWORD} `
        + `ssh -o StrictHostKeyChecking=no ${credentials.TEST_USER}@${node.url.ip} `
        + '\'google-chrome --version\'', [])
        .then((response) => {
          return (response.trim().match(/[0-9]{1,3}.[0-9]{1,3}/) || [ '' ])[0];
        });
    }
    return Promise.resolve({ message: 'windows not implemented yet' });
  }

  fetchChromeDriverVersion(node, credentials) {
    if (credentials.PLATFORM === 'LINUX') {
      return this.runCommand(`sshpass -p ${credentials.TEST_PASSWORD} `
        + `ssh -o StrictHostKeyChecking=no ${credentials.TEST_USER}@${node.url.ip} `
        + '\'/opt/selenium/chromedriver --version\'', [])
        .then((response) => {
          return (response.trim().match(/[0-9]{1,3}.[0-9]{1,3}/) || [ '' ])[0];
        });
    }
    return Promise.resolve({ message: 'windows not implemented yet' });
  }

  fetchFirefoxVersion(node, credentials) {
    if (credentials.PLATFORM !== 'WINDOWS') {
      return this.runCommand(`sshpass -p ${credentials.TEST_PASSWORD} `
        + `ssh -o StrictHostKeyChecking=no ${credentials.TEST_USER}@${node.url.ip} `
        + '\'firefox -v\'', [])
        .then((response) => {
          return (response.trim().match(/[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/) || [ '' ])[0];
        });
    }
    return Promise.resolve({ message: 'windows not implemented yet' });
  }

  fetchOutdatedPackages(node, credentials) {
    if (credentials.PLATFORM === 'LINUX') {
      return this.runCommand(`sshpass -p ${credentials.TEST_PASSWORD} `
        + `ssh -o StrictHostKeyChecking=no ${credentials.TEST_USER}@${node.url.ip} `
        + `\'echo ${credentials.TEST_PASSWORD} | sudo -S apt update > /dev/null && apt list --upgradable\'`, [])
        .then((response) => {
          return response.split(/[\n]+/)
            .map(e => e.match(/([^/]+?)\/[\S]+\s([\S]+)\s.*\[upgradable from: ([^\]]+?)\]/) || [ '' ])
            .map(e => {
              if (e[1] && e[2] && e[3]) {
                return { name: e[1], currentVersion: e[3], newVersion: e[2] };
              }
              return null;
            })
            .filter(e => e !== null);
        });
    }
    return Promise.resolve({ message: 'windows not implemented yet' });
  }
  getEnvironment() {
    return new Promise((resolve) => {
      DashboardSeleniumNode.find().exec()
        .then((data) => {
          resolve(data);
        });
    });
  }

  trackCoverage() {
    Project.find({}).exec()
        .then((projects) => {
          for (const project of projects) {
            if (!project.disableCoverageTrack) {
              this.fetchProjectCoverage(project);
            }
          }
        })
        .catch((err) => {
          console.log({ error: 'Failed to get projects list from DB', originalError: err });
        });
  }

  fetchProjectCoverage(project) {
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

  runCommand(cmd, args) {
    return new Promise((resolve) => {
      const child = exec(cmd, args);
      let resp = '';

      child.stdout.on('data', (buffer) => resp += buffer.toString());
      child.stdout.on('end', () => resolve(resp));
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
