package com.ak.cucumber.runner.util.api.model.runtime;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Match {

    @JsonProperty("location")
    private String location;

    public Match(String location) {
        this.location = location;
    }
}
