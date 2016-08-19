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

var RepositorySchema = new Schema({
  url: {type: String, unique: true},
  name: String,
  projects: [{type: Schema.Types.ObjectId, ref: 'Project'}]
});

var ProjectSchema = new Schema({
  name: String,
  classpath: [String],
  glue: String
});

var FeatureSchema = new Schema({
  _id: Number,
  name: String,
  sourcePath: String,
  scenarios: [{type: Schema.Types.ObjectId, ref: 'Scenario'}]
});

var TagExecutionResultSchema = new Schema({
  tag: {type: String, unique: true},
  executions: [
    {
      result: String,
      time: {type: Date, default: Date.now}
    }
  ],
  reviewed: {type: Boolean, 'default': false}
});

var ScenarioSchema = new Schema({
  _feature: {type: Number, ref: 'Feature'},
  repositoryPath: String,
  project: String,
  classpath: String,
  featureName: String,
  scenarioName: String,
  scenarioLine: Number,
  tags: Array
});

ScenarioSchema.index({
  repositoryPath: 1,
  featureName: 1,
  scenarioName: 1,
  scenarioLine: 1
}, {unique: true});

var Scenario = mongoose.model('Scenario', ScenarioSchema);
var Feature = mongoose.model('Feature', FeatureSchema);
var Project = mongoose.model('Project', ProjectSchema);
var Repository = mongoose.model('Repository', RepositorySchema);
var TagExecutionResult = mongoose.model('TagExecutionResult', TagExecutionResultSchema);

module.exports.Scenario = Scenario;
module.exports.Feature = Feature;
module.exports.Project = Project;
module.exports.Repository = Repository;
module.exports.TagExecutionResult = TagExecutionResult;