package com.ak.cucumber.runner.util.api;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ak.cucumber.runner.util.api.model.QueueState;
import com.ak.cucumber.runner.util.api.model.ReportPayload;
import com.fasterxml.jackson.databind.ObjectMapper;

import retrofit2.Call;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.jackson.JacksonConverterFactory;

public class CucumberRunnerApiUtil {

    private static final Logger LOG = Logger.getLogger(CucumberRunnerApiUtil.class.getSimpleName());

    private static final String CUCUMBER_RUNNER_URL = String.format("http://%s:%s/",
            System.getProperty("queue.url", "localhost"),
            System.getProperty("queue.port", "8081"));

    private String sessionId;

    private String slaveId;

    public CucumberRunnerApiUtil(String sessionId, String slaveId) {
        this.sessionId = sessionId;
        this.slaveId = slaveId;
    }

    public QueueState getNextScenario() {
        try {
            return doCall(getCucumberRunnerService().getNextScenario(sessionId, slaveId)).body();
        } catch (Exception e) {
            LOG.log(Level.SEVERE, e.getMessage(), e);
            return new QueueState();
        }
    }

    public void sendScenarioResult(String scenarioId, String reportJson) throws Exception {
        try {
            ReportPayload reportPayload = new ReportPayload(scenarioId, new ObjectMapper().readTree(reportJson));

            doCall(getCucumberRunnerService().saveScenarioReport(sessionId, reportPayload));
        } catch (IOException e) {
            LOG.log(Level.SEVERE, e.getMessage(), e);
        }
    }

    public static CucumberRunnerService getCucumberRunnerService() {
        return new Retrofit.Builder()
                .addConverterFactory(JacksonConverterFactory.create())
                .baseUrl(CUCUMBER_RUNNER_URL).build().create(CucumberRunnerService.class);
    }

    public static <T> Response<T> doCall(Call<T> call) throws Exception {
        try {
            return call.execute();
        } catch (IOException e) {
            LOG.log(Level.SEVERE, e.getMessage(), e);
            throw new Exception("Failed to execute call", e);
        }
    }
}
