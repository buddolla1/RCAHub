package com.syf.rcahub.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public record RcaRequest(
        @Min(value = 1, message = "Serial number must be positive")
        Long serialNumber,

        @Size(max = 100, message = "Incident number must not exceed 100 characters")
        String incidentNumber,

        @Min(value = 1, message = "Incident month must be between 1 and 12")
        @Max(value = 12, message = "Incident month must be between 1 and 12")
        Integer incidentMonth,

        @Min(value = 2000, message = "Incident year must be 2000 or later")
        @Max(value = 9999, message = "Incident year must not exceed 9999")
        Integer incidentYear,

        @Size(max = 100, message = "Change ticket must not exceed 100 characters")
        @NotBlank(message = "Change number is required")
        String changeTicket,

        @NotBlank(message = "Severity / priority is required")
        @Pattern(regexp = "P1|P2|P3|P4", message = "Severity / priority is not supported")
        @Size(max = 30, message = "Priority must not exceed 30 characters")
        String priority,

        @Size(max = 100, message = "Tower must not exceed 100 characters")
        String tower,

        @Size(max = 150, message = "Application must not exceed 150 characters")
        @NotBlank(message = "Application name is required")
        String application,

        @Size(max = 150, message = "Program manager must not exceed 150 characters")
        @NotBlank(message = "Program manager is required")
        String programManager,

        @Size(max = 150, message = "ART team name must not exceed 150 characters")
        @NotBlank(message = "ART team name is required")
        String artTeamName,

        @NotBlank(message = "Issue description is required")
        @Size(max = 10000, message = "Issue description must not exceed 10000 characters")
        String issueDescription,

        LocalDateTime releaseDatetime,

        @Pattern(regexp = "Not Required|Planned|In Progress|Completed|Failed",
                message = "Rollback status is not supported")
        String rollbackStatus,

        @NotNull(message = "Start time is required")
        LocalDateTime incidentStartTime,
        @NotNull(message = "End time is required")
        LocalDateTime incidentEndTime,

        @Size(max = 255, message = "Impacted system must not exceed 255 characters")
        String impactedSystem,

        @Size(max = 10000, message = "Business impact must not exceed 10000 characters")
        @NotBlank(message = "Customer / business impact is required")
        String businessImpact,

        @Size(max = 10000, message = "Root cause must not exceed 10000 characters")
        String rootCause,

        @Pattern(regexp = "Technical|Process|Both", message = "RCA type is not supported")
        String rcaType,

        @Size(max = 10000, message = "Remedy used must not exceed 10000 characters")
        String remedyUsed,

        @NotBlank(message = "Detection point is required")
        @Pattern(regexp = "Monitoring|Customer|Manual|Other", message = "Detection point is not supported")
        String detectionPoint,

        @Size(max = 10000, message = "Preventive actions must not exceed 10000 characters")
        String preventiveActions,

        @NotBlank(message = "RCA status is required")
        @Pattern(regexp = "Open|In Progress|Pending Review|Request Closure|Closed", message = "RCA status is not supported")
        String rcaStatus,

        @NotBlank(message = "RCA category is required")
        @Pattern(regexp = "Incident|Rollback|Emergency Fix", message = "RCA category is not supported")
        String rcaCategory,

        @NotBlank(message = "Portfolio name is required")
        @Size(max = 100, message = "Portfolio name must not exceed 100 characters")
        String portfolioName,

        @Size(max = 10000, message = "Detection point detail must not exceed 10000 characters")
        String detectionPointDetail,

        @NotBlank(message = "Impacted systems / services are required")
        @Size(max = 10000, message = "Impacted systems / services must not exceed 10000 characters")
        String impactedSystems,

        @NotBlank(message = "Resolution is required")
        @Size(max = 10000, message = "Resolution must not exceed 10000 characters")
        String resolution,

        List<@Pattern(regexp = "Configuration Issue|Code Issue|Environment Issue|Inadequate Testing|Requirement Gap|Missed Pre-Deployment Verification|Impact Analysis|DB Performance Issue|Infrastructure Changes|Application Code Release|DB Changes",
                message = "Root cause issue is not supported") String> rootCauseIssues,

        @Size(max = 10000, message = "Other category detail must not exceed 10000 characters")
        String rootCauseOtherDetail,

        @Size(max = 100, message = "Review type must not exceed 100 characters")
        @Pattern(regexp = "Reviewer: ART team|Reviewer: SRE/Release mgmt", message = "Review type is not supported")
        String reviewType,

        List<@Valid TeamActionRequest> teamActions) {
}
