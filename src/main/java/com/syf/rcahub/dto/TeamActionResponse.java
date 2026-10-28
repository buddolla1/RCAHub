package com.syf.rcahub.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TeamActionResponse(
        Long id,
        String teamName,
        String learnings,
        String correctiveActions,
        String ticketNumber,
        LocalDate targetCompletionDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
