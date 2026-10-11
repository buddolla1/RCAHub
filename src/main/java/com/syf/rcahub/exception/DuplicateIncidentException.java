package com.syf.rcahub.exception;

public class DuplicateIncidentException extends RuntimeException {

    public DuplicateIncidentException(String incidentNumber) {
        super("An RCA with incident number '" + incidentNumber + "' already exists");
    }
}
