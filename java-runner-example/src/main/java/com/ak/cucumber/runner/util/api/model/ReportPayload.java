package com.ak.cucumber.runner.util.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

public class ReportPayload {

    @JsonProperty("id")
    private String id;

    @JsonProperty("report")
    private JsonNode report;

    public ReportPayload(String id, JsonNode report) {
        this.id = id;
        this.report = report;
    }
}
