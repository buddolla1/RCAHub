package com.syf.rcahub.dto;

import java.time.LocalDateTime;
import java.util.List;

public record RcaResponse(
        Long id,
        Long serialNumber,
        String incidentNumber,
        Integer incidentMonth,
        Integer incidentYear,
        String monthYear,
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
        String rcaCategory,
        String portfolioName,
        String detectionPointDetail,
        String impactedSystems,
        String resolution,
        List<String> rootCauseIssues,
        String rootCauseOtherDetail,
        String reviewType,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<TeamActionResponse> teamActions) {
}
