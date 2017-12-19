package com.ak.cucumber.runner.util.api;

import com.ak.cucumber.runner.util.api.model.QueueState;
import com.ak.cucumber.runner.util.api.model.ReportPayload;
import com.ak.cucumber.runner.util.api.model.runtime.StepUpdatePayload;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface CucumberRunnerService {

    @GET("api/sessions/{sessionId}/next")
    Call<QueueState> getNextScenario(@Path("sessionId") String sessionId, @Query("executor") String executor);

    @POST("api/sessions/{sessionId}/reports")
    Call<ResponseBody> saveScenarioReport(@Path("sessionId") String sessionId, @Body ReportPayload payload);

    @POST("api/sessions/{sessionId}/runtime/{scenarioId}")
    Call<ResponseBody> updateScenarioRuntimeReport(@Path("sessionId") String sessionId,
            @Path("scenarioId") String scenarioId, @Body StepUpdatePayload payload);
}
