package com.syf.rcahub.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TeamAction(
        Long id,
        Long rcaIncidentId,
        String teamName,
        String learnings,
        String correctiveActions,
        String ticketNumber,
        LocalDate targetCompletionDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
