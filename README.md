# Cucumber Runner

Cucumber Runner is a web-service based tool for Cucumber scenarios parallel execution.

## Getting Started
To start service you need Node.js and Mongo DB installed.

Then do the following:
1. Clone this repository
2. Update `/src/config/template.config.json` with your settings
3. Install required dependencies with `npm install`
### for development
1. Start nodemon for server-side:
```sh
CONFIG_FILE=<full_path_to_config> npm run nodemon
```
2. Start webpack-dev-server for client-side:
```sh
npm run webpack-dev-server
```

### for production
1. Build project using `npm run build`
2. Start service:
```sh
NODE_ENV=production CONFIG_FILE=<full_path_to_config> node server.js
```

# How It Works

Cucumber tests executions are split by projects, identified by working copy location, cucumber features path and project tag (cucumber tag which marks all scenarios related to current project).

To add new project, go to `http://<server_url>/projects` and click `Add Project`.
Fill and submit form:
| Form Field | Description | Example |
| ---------- | ----------- | ------- |
| Project ID | custom string that identifies project in API | `app-tests` |
| Display Name | name that will be shown in UI | `App Tests` |
| Working Copy Path | path to working copy on server machine (source code should be downloaded before using it) | `<full_path_to_working_copy>` |
| Features Root Path | relative path to Cucumber features | `src/test/resources/` |
| Project Tag | Cucumber tag that identifies all scenarios related to a project | `@tag` |
| Description | project description | `any text` |

Here is a sample configuration:
#### before tests (on Jenkins):
1. Scan project:
```sh
curl http://<server_url>/api/projects/<project_id>/scan
```
2. Start session:
```sh
http://<server_url>/api/sessions/start?tags=<project_tag>&scope=[full|daily|failed|dev|custom]&project=<project_id>&link=<jenkins_build_url>
```

#### tests (on tests executor, testing code in Java):
Get the same automation source code version used to scan project on Cucumber Runner.
Run following cycle:
1. Get next scenario: call `http://<server_url>/api/sessions/<session_id>/next`
2. Based on `state` parameter from response payload:
   * `state == NOT_FOUND` - no such session, stop testing
   * `state == IN_PROGRESS` - no tests to execute, but some are still taken by another executors
   * `state == OK`:
      1. read `scenario` object from response payload
      2. call Cucumber.api.cli.Main for taken scenario:
```java
cucumber.api.cli.Main.run(new String[] {
  "--glue", "com.package.app.tests",
  "classpath:" + scenarioObject.getScenarioPath() },
  ParallelRunner.class.getClassLoader());
```
   * `state == FINALIZATION` - all tests were executed, stop testing

#### after tests (on Jenkins):
1. Check execution state: `curl http://<server_url>/api/sessions/<session_id>/state` (wait till state will not be OK)
2. Download reports.zip: `curl http://<server_url>/api/sessions/history/<session_id>/zip`
3. Downloaded reports are Cucumber JSON reports split by feature, and can be passed to cucumber-reports plugin, etc.

### Limitations
This service is implemented to be used in our project, and is optimized for running on OSX or Linux, and checked with Java-based cucumber tests. Feel free to provide any improvements to make it more generic.
