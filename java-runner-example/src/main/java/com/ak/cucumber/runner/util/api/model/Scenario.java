package com.ak.cucumber.runner.util.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Scenario {

    @JsonProperty("id")
    private String scenarioId = null;

    @JsonProperty("path")
    private String scenarioPath = "";

    public String getScenarioId() {
        return scenarioId;
    }

    public String getScenarioPath() {
        return scenarioPath;
    }
}
