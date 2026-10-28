package com.syf.rcahub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record TeamActionRequest(
        @NotBlank(message = "Team name is required")
        @Pattern(regexp = "Dev|QA|RTS|Program Management|Release Management",
                message = "Team name must be Dev, QA, RTS, Program Management, or Release Management")
        String teamName,

        @Size(max = 10000, message = "Learnings must not exceed 10000 characters")
        @NotBlank(message = "Learnings / action items are required; enter NA if not applicable")
        String learnings,

        @Size(max = 10000, message = "Corrective actions must not exceed 10000 characters")
        @NotBlank(message = "Corrective actions are required; enter NA if not applicable")
        String correctiveActions,

        @Size(max = 100, message = "Ticket number must not exceed 100 characters")
        String ticketNumber,

        LocalDate targetCompletionDate) {
}
