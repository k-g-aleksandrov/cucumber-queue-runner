package com.ak.cucumber.runner.stepdefs;

import cucumber.api.java.en.And;

public class CucumberSteps {

    @And("^sleep (\\d+)$")
    public void sleep(int seconds) {
        try {
            Thread.sleep(seconds * 1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}