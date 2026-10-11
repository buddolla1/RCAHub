package com.syf.rcahub.model;

import java.time.LocalDateTime;

public record RcaIncident(
        Long id,
        Long serialNumber,
        String incidentNumber,
        Integer incidentMonth,
        Integer incidentYear,
        String changeTicket,
        String priority,
        String tower,
        String application,
        String programManager,
        String artTeamName,
        String issueDescription,
        LocalDateTime releaseDatetime,
        String rollbackStatus,
        LocalDateTime incidentStartTime,
        LocalDateTime incidentEndTime,
        String impactedSystem,
        String businessImpact,
        String rootCause,
        String rcaType,
        String remedyUsed,
        String detectionPoint,
        String preventiveActions,
        String rcaStatus,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
