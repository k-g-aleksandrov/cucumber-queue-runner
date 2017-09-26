package com.ak.cucumber.runner.util.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class QueueState {

    @JsonProperty("scenario")
    private Scenario scenario;

    @JsonProperty("state")
    private StateEnum state = StateEnum.NOT_FOUND;

    public String getScenarioId() {
        if (scenario != null) {
            return scenario.getScenarioId();
        }
        return null;
    }

    public String getScenarioPath() {
        if (scenario != null) {
            return scenario.getScenarioPath();
        }
        return null;
    }

    public StateEnum getState() {
        return state;
    }

    public void setState(StateEnum state) {
        this.state = state;
    }

    @Override
    public String toString() {
        return state.toString();
    }
}
