import mongoose from 'mongoose';
const log = require('libs/log')(module);

const dockerAddr = (process.env.MONGO_PORT_27017_TCP_ADDR)
  ? process.env.MONGO_PORT_27017_TCP_ADDR
  : '192.168.99.100';
const dockerPort = (process.env.MONGO_PORT_27017_TCP_PORT)
  ? process.env.MONGO_PORT_27017_TCP_PORT
  : '27017';

var connectWithRetry = function () {
  const mongoUrl = `mongodb://${dockerAddr}:${dockerPort}/cucumber-queue-db`;

  return mongoose.connect(mongoUrl, (err) => {
    if (err) {
      log.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
      setTimeout(connectWithRetry, 5000);
    }
  });
};

connectWithRetry();

const db = mongoose.connection;

db.once('open', () => {
  log.info('Connected to DB!');
});

const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  projectId: { type: String, unique: true },
  name: String,
  tag: String,
  description: String,
  workingCopyPath: String,
  featuresRoot: String
});

const FilterSchema = new Schema({
  filterId: { type: String, unique: true },
  filter: Object
});

const ExecutionSchema = new Schema({
  scenarioId: { type: String, unique: true },
  executions: [
    {
      result: String,
      startTimestamp: { type: Date },
      endTimestamp: { type: Date, default: Date.now },
      executor: String
    }
  ]
});

const ScenarioSchema = new Schema({
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
}, { unique: true });

ScenarioSchema.methods.getScenarioId = function getScenarioId() {
  return `${this.featureName} -> ${this.scenarioName}(${this.exampleParams})`;
};

const Scenario = mongoose.model('Scenario', ScenarioSchema);
const Project = mongoose.model('Project', ProjectSchema);
const Filter = mongoose.model('Filter', FilterSchema);
const Execution = mongoose.model('Execution', ExecutionSchema);

module.exports.Scenario = Scenario;
module.exports.Project = Project;
module.exports.Filter = Filter;
module.exports.Execution = Execution;
