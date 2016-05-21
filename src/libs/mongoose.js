'use strict';

var mongoose = require('mongoose');
var log = require('libs/log')(module);

var dockerAddr = (process.env.MONGO_PORT_27017_TCP_ADDR)
  ? process.env.MONGO_PORT_27017_TCP_ADDR
  : '192.168.99.100';
var dockerPort = (process.env.MONGO_PORT_27017_TCP_PORT)
  ? process.env.MONGO_PORT_27017_TCP_PORT
  : '27017';
mongoose.connect('mongodb://' + dockerAddr + ':' + dockerPort
  + '/cucumber-queue-db');
var db = mongoose.connection;

db.on('error', (err) => {
  log.error('connection error:', err.message);
});

db.once('open', () => {
  log.info('Connected to DB!');
});

var Schema = mongoose.Schema;

var RepositorySchema = new Schema({
  url: {type: String, index: {unique: true}},
  name: String,
  username: String,
  password: String,
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

var ScenarioSchema = new Schema({
  _feature: {type: Number, ref: 'Feature'},
  classpath: String,
  featureName: String,
  scenarioName: String,
  scenarioLine: Number,
  tags: Array
});
ScenarioSchema.index({
  featureName: 1,
  scenarioName: 1,
  scenarioLine: 1
}, {unique: true});

var Scenario = mongoose.model('Scenario', ScenarioSchema);
var Feature = mongoose.model('Feature', FeatureSchema);
var Project = mongoose.model('Project', ProjectSchema);
var Repository = mongoose.model('Repository', RepositorySchema);

module.exports.Scenario = Scenario;
module.exports.Feature = Feature;
module.exports.Project = Project;
module.exports.Repository = Repository;
