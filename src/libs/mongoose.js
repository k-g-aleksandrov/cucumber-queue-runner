'use strict';

var mongoose = require('mongoose');
var log = require('libs/log')(module);

var dockerAddr = (process.env.MONGO_PORT_27017_TCP_ADDR)
  ? process.env.MONGO_PORT_27017_TCP_ADDR
  : '192.168.99.100';
var dockerPort = (process.env.MONGO_PORT_27017_TCP_PORT)
  ? process.env.MONGO_PORT_27017_TCP_PORT
  : '27017';

var connectWithRetry = function () {
  let mongoUrl = 'mongodb://' + dockerAddr + ':' + dockerPort + '/cucumber-queue-db';

  return mongoose.connect(mongoUrl, function (err) {
    if (err) {
      log.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
      setTimeout(connectWithRetry, 5000);
    }
  });
};

connectWithRetry();

var db = mongoose.connection;

db.once('open', () => {
  log.info('Connected to DB!');
});

var Schema = mongoose.Schema;

var ProjectSchema = new Schema({
  projectId: {type: String, unique: true},
  name: String,
  tag: String,
  description: String,
  workingCopyPath: String,
  featuresRoot: String
});

var FilterSchema = new Schema({
  filterId: {type: String, unique: true},
  filter: Object
});

var ExecutionSchema = new Schema({
  scenarioId: {type: String, unique: true},
  executions: [
    {
      result: String,
      startTimestamp: {type: Date},
      endTimestamp: {type: Date, default: Date.now},
      executor: String
    }
  ]
});

var ScenarioSchema = new Schema({
  project: String,
  classpath: String,
  featureName: String,
  scenarioName: String,
  exampleParams: String,
  scenarioLine: Number,
  tags: Array
});

ScenarioSchema.index({
  project: 1,
  featureName: 1,
  scenarioName: 1,
  exampleParams: 1
}, {unique: true});

ScenarioSchema.methods.getScenarioId = function getScenarioId() {
  return this.featureName + ' -> ' + this.scenarioName + '(' + this.exampleParams + ')';
};

var Scenario = mongoose.model('Scenario', ScenarioSchema);
var Project = mongoose.model('Project', ProjectSchema);
var Filter = mongoose.model('Filter', FilterSchema);
var Execution = mongoose.model('Execution', ExecutionSchema);

module.exports.Scenario = Scenario;
module.exports.Project = Project;
module.exports.Filter = Filter;
module.exports.Execution = Execution;
