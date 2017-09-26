package com.ak.cucumber.runner.util.cucumber;

import static com.ak.cucumber.runner.util.api.CucumberRunnerApiUtil.doCall;
import static com.ak.cucumber.runner.util.api.CucumberRunnerApiUtil.getCucumberRunnerService;

import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ak.cucumber.runner.util.api.model.runtime.Hook;
import com.ak.cucumber.runner.util.api.model.runtime.Match;
import com.ak.cucumber.runner.util.api.model.runtime.Result;
import com.ak.cucumber.runner.util.api.model.runtime.Step;
import com.ak.cucumber.runner.util.api.model.runtime.StepUpdatePayload;

public class RuntimeReporter {

    private static final Logger LOG = Logger.getLogger(RuntimeReporter.class.getSimpleName());

    private String sessionId;

    private String scenarioId;

    public RuntimeReporter(String sessionId, String scenarioId) {
        this.sessionId = sessionId;
        this.scenarioId = scenarioId;

    }

    public void reportBefore(gherkin.formatter.model.Match match, gherkin.formatter.model.Result result) {
        Hook report = new Hook(new Match(match.getLocation()),
                new Result(result.getStatus(), result.getDuration(), result.getErrorMessage()));
        StepUpdatePayload payload = new StepUpdatePayload("before", report);

        try {
            doCall(getCucumberRunnerService().updateScenarioRuntimeReport(sessionId, scenarioId, payload));
        } catch (Exception e) {
            LOG.log(Level.SEVERE, e.getMessage(), e);
        }
    }

    public void reportStepStarted(String stepName) {
        Step report = new Step("<Step>", stepName, 0, new Date().getTime(), null);
        StepUpdatePayload payload = new StepUpdatePayload("step", report);

        try {
            doCall(getCucumberRunnerService().updateScenarioRuntimeReport(sessionId, scenarioId, payload));
        } catch (Exception e) {
            LOG.log(Level.SEVERE, e.getMessage(), e);
        }
    }

    public void reportStepResult(gherkin.formatter.model.Step step, gherkin.formatter.model.Result result) {
        Step report = new Step(step.getKeyword(), step.getName(), step.getLine(), null,
                new Result(result.getStatus(), result.getDuration(), result.getErrorMessage()));
        StepUpdatePayload payload = new StepUpdatePayload("step", report);

        try {
            doCall(getCucumberRunnerService().updateScenarioRuntimeReport(sessionId, scenarioId, payload));
        } catch (Exception e) {
            LOG.log(Level.SEVERE, e.getMessage(), e);
        }
    }

    public void reportAfter(gherkin.formatter.model.Match match, gherkin.formatter.model.Result result) {
        Hook report = new Hook(new Match(match.getLocation()),
                new Result(result.getStatus(), result.getDuration(), result.getErrorMessage()));
        StepUpdatePayload payload = new StepUpdatePayload("after", report);

        try {
            doCall(getCucumberRunnerService().updateScenarioRuntimeReport(sessionId, scenarioId, payload));
        } catch (Exception e) {
            LOG.log(Level.SEVERE, e.getMessage(), e);
        }
    }
}
