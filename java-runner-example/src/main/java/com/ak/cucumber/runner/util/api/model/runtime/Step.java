package com.ak.cucumber.runner.util.api.model.runtime;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Step extends UpdateContentPayload {

    @JsonProperty("keyword")
    private String keyword;

    @JsonProperty("name")
    private String name;

    @JsonProperty("line")
    private int line;

    @JsonProperty("startTime")
    private Long startTime;

    @JsonProperty("result")
    private Result result;

    public Step(String keyword, String name, int line, Long startTime, Result result) {
        this.keyword = keyword;
        this.name = name;
        this.line = line;
        this.startTime = startTime;
        this.result = result;
    }
}
