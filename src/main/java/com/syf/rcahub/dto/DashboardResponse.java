package com.syf.rcahub.dto;

import java.util.List;

public record DashboardResponse(
        long totalRcas,
        long completedRollbacks,
        long openRcas,
        long inProgressRcas,
        long completedRcas,
        List<CountMetric> byPriority,
        List<CountMetric> byMonth,
        List<CountMetric> byApplication,
        List<CountMetric> byRollbackStatus) {
}
