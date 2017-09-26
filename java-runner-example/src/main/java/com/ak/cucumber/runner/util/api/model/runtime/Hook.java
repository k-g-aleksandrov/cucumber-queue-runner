package com.ak.cucumber.runner.util.api.model.runtime;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Hook extends UpdateContentPayload {

    @JsonProperty("match")
    private Match match;

    @JsonProperty("result")
    private Result result;

    public Hook(Match match, Result result) {
        this.match = match;
        this.result = result;
    }
}
