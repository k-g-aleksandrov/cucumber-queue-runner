package com.ak.cucumber.runner.util.cucumber;

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import cucumber.runtime.StepDefinitionMatch;
import cucumber.runtime.formatter.CucumberJSONFormatter;
import gherkin.formatter.model.Match;
import gherkin.formatter.model.Result;
import gherkin.formatter.model.Scenario;
import gherkin.formatter.model.Step;

enum ScenarioState {
    NOT_STARTED, BACKGROUND, EXECUTION
}

public class CucumberReporter extends CucumberJSONFormatter {

    private static final Logger LOG = Logger.getLogger(CucumberReporter.class.getSimpleName());

    private Map<Step, Result> stepsExecutionStatus = new LinkedHashMap<>();

    private Iterator<Step> statusIterator = null;

    private ScenarioState scenarioState = ScenarioState.NOT_STARTED;

    private Step lastBackgroundStep = null;

    public static ThreadLocal<String> sessionId = new ThreadLocal<>();
    public static ThreadLocal<String> scenarioId = new ThreadLocal<>();

    private ThreadLocal<RuntimeReporter> runtimeReporter = new ThreadLocal<>();

    public CucumberReporter(Appendable out) {
        super(out);
    }

    @Override
    public void before(Match match, Result result) {
        runtimeReporter.get().reportBefore(match, result);
        super.before(match, result);
    }

    @Override
    public void startOfScenarioLifeCycle(Scenario scenario) {
        runtimeReporter.set(new RuntimeReporter(sessionId.get(), scenarioId.get()));
        scenarioState = ScenarioState.BACKGROUND;
        super.startOfScenarioLifeCycle(scenario);
    }

    @Override
    public void scenario(Scenario scenario) {
        scenarioState = ScenarioState.EXECUTION;
        super.scenario(scenario);
    }

    @Override
    public void match(Match match) {
        if (match instanceof StepDefinitionMatch) {
            runtimeReporter.get().reportStepStarted(((StepDefinitionMatch) match).getStepName());
        }
        super.match(match);
    }

    @Override
    public void result(Result result) {
        try {
            if (statusIterator == null) {
                statusIterator = stepsExecutionStatus.keySet().iterator();
            }
            final Step st = statusIterator.next();
            stepsExecutionStatus.put(st, result);

            runtimeReporter.get().reportStepResult(st, result);
        } catch (Exception e) {
            LOG.log(Level.SEVERE, e.getMessage(), e);
        }
        super.result(result);
    }

    @Override
    public void step(Step step) {
        try {
            if (scenarioState == ScenarioState.NOT_STARTED) {
                return;
            }

            stepsExecutionStatus.put(step, Result.UNDEFINED);
            statusIterator = stepsExecutionStatus.keySet().iterator();

            if (scenarioState != ScenarioState.EXECUTION) {
                lastBackgroundStep = step;
            } else if (lastBackgroundStep != null) {
                Step iteratedStep;
                do {
                    if (!statusIterator.hasNext()) {
                        break;
                    }
                    iteratedStep = statusIterator.next();
                } while (!iteratedStep.equals(lastBackgroundStep));
            }
        } catch (Exception e) {
            LOG.log(Level.SEVERE, e.getMessage(), e);
        }
        super.step(step);
    }

    @Override
    public void after(Match match, Result result) {
        runtimeReporter.get().reportAfter(match, result);
        super.after(match, result);
    }

    @Override
    public void endOfScenarioLifeCycle(Scenario scenario) {
        stepsExecutionStatus.clear();
        statusIterator = null;
        lastBackgroundStep = null;
        scenarioState = ScenarioState.NOT_STARTED;
        super.endOfScenarioLifeCycle(scenario);
    }
}
