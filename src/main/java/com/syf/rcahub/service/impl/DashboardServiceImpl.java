package com.syf.rcahub.service.impl;

import com.syf.rcahub.dto.DashboardResponse;
import com.syf.rcahub.repository.DashboardRepository;
import com.syf.rcahub.service.DashboardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final DashboardRepository dashboardRepository;

    public DashboardServiceImpl(DashboardRepository dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getSummary() {
        return dashboardRepository.getSummary();
    }
}
