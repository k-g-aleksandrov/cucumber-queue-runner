package com.ak.cucumber.runner.util.api.model.runtime;

import com.fasterxml.jackson.annotation.JsonProperty;

public class StepUpdatePayload {

    @JsonProperty("type") // before / after / step / executor
    private String type;

    @JsonProperty("report")
    private UpdateContentPayload payload;

    public StepUpdatePayload(String type, UpdateContentPayload payload) {
        this.type = type;
        this.payload = payload;
    }
}
