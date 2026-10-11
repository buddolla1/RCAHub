package com.syf.rcahub.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public record RcaRequest(
        @Min(value = 1, message = "Serial number must be positive")
        Long serialNumber,

        @NotBlank(message = "Incident number is required")
        @Size(max = 100, message = "Incident number must not exceed 100 characters")
        String incidentNumber,

        @Min(value = 1, message = "Incident month must be between 1 and 12")
        @Max(value = 12, message = "Incident month must be between 1 and 12")
        Integer incidentMonth,

        @Min(value = 2000, message = "Incident year must be 2000 or later")
        @Max(value = 9999, message = "Incident year must not exceed 9999")
        Integer incidentYear,

        @Size(max = 100, message = "Change ticket must not exceed 100 characters")
        String changeTicket,

        @Size(max = 30, message = "Priority must not exceed 30 characters")
        String priority,

        @Size(max = 100, message = "Tower must not exceed 100 characters")
        String tower,

        @Size(max = 150, message = "Application must not exceed 150 characters")
        String application,

        @Size(max = 150, message = "Program manager must not exceed 150 characters")
        String programManager,

        @Size(max = 150, message = "ART team name must not exceed 150 characters")
        String artTeamName,

        @NotBlank(message = "Issue description is required")
        @Size(max = 10000, message = "Issue description must not exceed 10000 characters")
        String issueDescription,

        LocalDateTime releaseDatetime,

        @Pattern(regexp = "Not Required|Planned|In Progress|Completed|Failed",
                message = "Rollback status is not supported")
        String rollbackStatus,

        LocalDateTime incidentStartTime,
        LocalDateTime incidentEndTime,

        @Size(max = 255, message = "Impacted system must not exceed 255 characters")
        String impactedSystem,

        @Size(max = 10000, message = "Business impact must not exceed 10000 characters")
        String businessImpact,

        @Size(max = 10000, message = "Root cause must not exceed 10000 characters")
        String rootCause,

        @Pattern(regexp = "Technical|Process|Both", message = "RCA type is not supported")
        String rcaType,

        @Size(max = 10000, message = "Remedy used must not exceed 10000 characters")
        String remedyUsed,

        @Pattern(regexp = "Monitoring|Customer|Other", message = "Detection point is not supported")
        String detectionPoint,

        @Size(max = 10000, message = "Preventive actions must not exceed 10000 characters")
        String preventiveActions,

        @NotBlank(message = "RCA status is required")
        @Pattern(regexp = "Open|In Progress|Completed", message = "RCA status is not supported")
        String rcaStatus,

        List<@Valid TeamActionRequest> teamActions) {
}
