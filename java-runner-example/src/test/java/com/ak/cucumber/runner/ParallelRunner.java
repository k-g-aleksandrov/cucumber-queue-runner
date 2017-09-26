package com.ak.cucumber.runner;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.io.FileUtils;

import com.ak.cucumber.runner.util.api.CucumberRunnerApiUtil;
import com.ak.cucumber.runner.util.api.model.QueueState;
import com.ak.cucumber.runner.util.api.model.StateEnum;
import com.ak.cucumber.runner.util.cucumber.CucumberReporter;

public class ParallelRunner {
    private static final Logger LOG = Logger.getLogger(ParallelRunner.class.getSimpleName());

    private static Runnable task = () -> {
        QueueState queueState;

        String sessionId = System.getProperty("session.id", "undefined");
        String slaveId = System.getProperty("slave.id", "undefined");

        CucumberRunnerApiUtil queueUtil = new CucumberRunnerApiUtil(sessionId, slaveId);
        do {
            queueState = queueUtil.getNextScenario();
            if (queueState.getState() == StateEnum.NOT_FOUND) {
                sleep(10);
                LOG.log(Level.INFO, "Failed to get queue state for session " + sessionId);
                continue;
            } else if (queueState.getState() == StateEnum.IN_PROGRESS) {
                LOG.log(Level.INFO, "There are no new scenarios in queue, but still some scenarios in progress.");
                sleep(30);
                continue;
            } else if (queueState.getState() == StateEnum.FINALIZATION) {
                LOG.log(Level.INFO, "There are no any scenarios to execute in current session. Executor stopped");
                Thread.currentThread().interrupt();
                return;
            }
            try {
                CucumberReporter.sessionId.set(sessionId);
                CucumberReporter.scenarioId.set(queueState.getScenarioId());

                File reportJson = File.createTempFile("report_", "json");
                cucumber.api.cli.Main.run(
                        new String[] { "--glue", "com.ak.cucumber.runner", "--plugin",
                                "com.ak.cucumber.runner.util.cucumber.CucumberReporter:" + reportJson.getCanonicalPath(),
                                "classpath:" + queueState.getScenarioPath() },
                        ParallelRunner.class.getClassLoader());
                String result = FileUtils.readFileToString(reportJson, StandardCharsets.UTF_8);
                queueUtil.sendScenarioResult(queueState.getScenarioId(), result);
            } catch (Exception e) {
                LOG.log(Level.SEVERE, "Failed to execute scenario " + queueState.getScenarioPath(), e);
            }
        } while (true);
    };

    private ParallelRunner() {
    }

    private static void sleep(int seconds) {
        try {
            Thread.sleep(seconds * 1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private static void shutdownAndAwaitTermination(ExecutorService pool) {
        final int awaitTimeout = Integer.MAX_VALUE;
        pool.shutdown(); // Disable new tasks from being submitted
        try {
            // Wait a while for existing tasks to terminate
            if (!pool.awaitTermination(awaitTimeout, TimeUnit.MINUTES)) {
                pool.shutdownNow(); // Cancel currently executing tasks
                // Wait a while for tasks to respond to being cancelled
                if (!pool.awaitTermination(awaitTimeout, TimeUnit.MINUTES)) {
                    LOG.log(Level.SEVERE, "Pool did not terminate");
                }
            }
        } catch (InterruptedException ie) {
            LOG.log(Level.SEVERE, ie.getMessage(), ie);
            pool.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }

    public static void main(String[] args) throws IOException {
        int numberOfThreads = Integer.parseInt(System.getProperty("threads.count", "2"));

        ExecutorService pool = Executors.newFixedThreadPool(numberOfThreads);
        for (int i = 0; i < numberOfThreads; i++) {
            pool.submit(task);
        }
        shutdownAndAwaitTermination(pool);
    }
}
