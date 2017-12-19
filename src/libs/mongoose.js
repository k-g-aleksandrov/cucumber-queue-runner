import mongoose from 'mongoose';
import config from 'config';
import logTemplate from 'libs/log';
const log = logTemplate(module);

mongoose.Promise = Promise;

const dockerAddr = (process.env.MONGO_PORT_27017_TCP_ADDR)
  ? process.env.MONGO_PORT_27017_TCP_ADDR
  : config.get('db:server');
const dockerPort = (process.env.MONGO_PORT_27017_TCP_PORT)
  ? process.env.MONGO_PORT_27017_TCP_PORT
  : config.get('db:port');

function connectWithRetry() {
  const mongoUrl = `mongodb://${dockerAddr}:${dockerPort}/cucumber-queue-db`;

  return mongoose.connect(mongoUrl, (err) => {
    if (err) {
      log.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
      setTimeout(connectWithRetry, 5000);
    }
  });
}

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
  tags: Array,
  executions: Array,
  filters: Array
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

const SessionHistorySchema = new Schema({
  sessionId: String,
  details: Schema.Types.Mixed,
  briefStatus: Schema.Types.Mixed,
  features: [ { type: Schema.Types.ObjectId, ref: 'HistoryFeature' } ],
  tags: [ { type: Schema.Types.ObjectId, ref: 'HistoryTag' } ],
  failures: [ { type: Schema.Types.ObjectId, ref: 'HistoryScenario' } ],
  scenarios: [ { type: Schema.Types.ObjectId, ref: 'HistoryScenario' } ]
});

const TestRailMapSchema = new Schema({
  mappingDate: Schema.Types.Date,
  featuresToTestRailMap: Schema.Types.Mixed,
  testRailToFeaturesMap: Schema.Types.Mixed,
  sortedBySimilarity: Schema.Types.Mixed
});

const DashboardCoverageSchema = new Schema({
  date: Date,
  project: String,
  passed: Number,
  failed: Number,
  retest: Number,
  blocked: Number,
  untested: Number
});

DashboardCoverageSchema.index({
  date: 1,
  project: 1
}, { unique: true });

// New History

const HistoryFeatureSchema = new Schema({
  sessionId: String,
  name: String,
  passedScenarios: Number,
  failedScenarios: Number,
  skippedScenarios: Number,
  unstableScenarios: Number,
  passedSteps: Number,
  failedSteps: Number,
  skippedSteps: Number,
  pendingSteps: Number,
  undefinedSteps: Number,
  scenarios: [ { type: Schema.Types.ObjectId, ref: 'HistoryScenario' } ]
});

const HistoryTagSchema = new Schema({
  sessionId: String,
  name: String,
  scenarios: [ { type: Schema.Types.ObjectId, ref: 'HistoryScenario' } ]
});

const HistoryScenarioSchema = new Schema({
  scenario: Schema.Types.Mixed
});


const Scenario = mongoose.model('Scenario', ScenarioSchema);
const Project = mongoose.model('Project', ProjectSchema);
const Execution = mongoose.model('Execution', ExecutionSchema);
const SessionHistory = mongoose.model('SessionHistory', SessionHistorySchema);
const HistoryFeature = mongoose.model('HistoryFeature', HistoryFeatureSchema);
const HistoryTag = mongoose.model('HistoryTag', HistoryTagSchema);
const HistoryScenario = mongoose.model('HistoryScenario', HistoryScenarioSchema);
const TestRailMap = mongoose.model('TestRailMap', TestRailMapSchema);
const DashboardCoverage = mongoose.model('DashboardCoverage', DashboardCoverageSchema);

module.exports.Scenario = Scenario;
module.exports.Project = Project;
module.exports.Execution = Execution;
module.exports.SessionHistory = SessionHistory;
module.exports.HistoryFeature = HistoryFeature;
module.exports.HistoryTag = HistoryTag;
module.exports.HistoryScenario = HistoryScenario;
module.exports.TestRailMap = TestRailMap;
module.exports.DashboardCoverage = DashboardCoverage;
