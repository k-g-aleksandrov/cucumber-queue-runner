package com.ak.cucumber.runner.util.api.model.runtime;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Result {

    @JsonProperty("status")
    private String status;

    @JsonProperty("duration")
    private Long duration;

    @JsonProperty("error_message")
    private String errorMessage;

    public Result(String status, Long duration, String errorMessage) {
        this.status = status;
        this.duration = duration;
        this.errorMessage = errorMessage;
    }
}
