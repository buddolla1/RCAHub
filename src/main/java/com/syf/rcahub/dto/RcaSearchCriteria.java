package com.syf.rcahub.dto;

public record RcaSearchCriteria(
        int page,
        int size,
        String sortBy,
        String sortDirection,
        String incidentNumber,
        String priority,
        String application,
        String rcaStatus,
        Integer month,
        Integer year) {
}
