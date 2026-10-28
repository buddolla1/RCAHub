package com.syf.rcahub.service.impl;

import com.syf.rcahub.dto.PageResponse;
import com.syf.rcahub.dto.RcaRequest;
import com.syf.rcahub.dto.RcaResponse;
import com.syf.rcahub.dto.RcaSearchCriteria;
import com.syf.rcahub.dto.TeamActionRequest;
import com.syf.rcahub.dto.TeamActionResponse;
import com.syf.rcahub.exception.BusinessValidationException;
import com.syf.rcahub.exception.DuplicateIncidentException;
import com.syf.rcahub.exception.ResourceNotFoundException;
import com.syf.rcahub.model.RcaIncident;
import com.syf.rcahub.model.TeamAction;
import com.syf.rcahub.repository.RcaRepository;
import com.syf.rcahub.repository.TeamActionRepository;
import com.syf.rcahub.service.RcaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Month;
import java.time.format.TextStyle;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class RcaServiceImpl implements RcaService {

    private static final Logger log = LoggerFactory.getLogger(RcaServiceImpl.class);

    private final RcaRepository rcaRepository;
    private final TeamActionRepository teamActionRepository;

    public RcaServiceImpl(RcaRepository rcaRepository, TeamActionRepository teamActionRepository) {
        this.rcaRepository = rcaRepository;
        this.teamActionRepository = teamActionRepository;
    }

    @Override
    @Transactional
    public RcaResponse create(RcaRequest request) {
        validateBusinessRules(request);
        ensureIncidentNumberIsUnique(request.incidentNumber(), null);
        long id = rcaRepository.insert(request);
        teamActionRepository.replaceAll(id, actions(request));
        log.info("event=rca_created rcaId={} incidentNumber={}", id, request.incidentNumber());
        return findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RcaResponse> findAll(RcaSearchCriteria criteria) {
        List<RcaResponse> content = rcaRepository.findAll(criteria).stream()
                .map(incident -> toResponse(incident, List.of()))
                .toList();
        long total = rcaRepository.count(criteria);
        int totalPages = total == 0 ? 0 : (int) Math.ceil((double) total / criteria.size());
        return new PageResponse<>(content, criteria.page(), criteria.size(), total, totalPages);
    }

    @Override
    @Transactional(readOnly = true)
    public RcaResponse findById(long id) {
        RcaIncident incident = requireIncident(id);
        return toResponse(incident, teamActionRepository.findByIncidentId(id));
    }

    @Override
    @Transactional
    public RcaResponse update(long id, RcaRequest request) {
        requireIncident(id);
        validateBusinessRules(request);
        ensureIncidentNumberIsUnique(request.incidentNumber(), id);
        rcaRepository.update(id, request);
        teamActionRepository.replaceAll(id, actions(request));
        log.info("event=rca_updated rcaId={} incidentNumber={}", id, request.incidentNumber());
        return findById(id);
    }

    @Override
    @Transactional
    public void delete(long id) {
        if (rcaRepository.deleteById(id) == 0) {
            throw new ResourceNotFoundException("RCA " + id + " was not found");
        }
        log.info("event=rca_deleted rcaId={}", id);
    }

    private RcaIncident requireIncident(long id) {
        return rcaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RCA " + id + " was not found"));
    }

    private void ensureIncidentNumberIsUnique(String incidentNumber, Long excludedId) {
        if (incidentNumber == null || incidentNumber.isBlank()) {
            return;
        }
        String normalized = incidentNumber.trim();
        if (rcaRepository.existsByIncidentNumber(normalized, excludedId)) {
            throw new DuplicateIncidentException(normalized);
        }
    }

    private void validateBusinessRules(RcaRequest request) {
        if ("Incident".equals(request.rcaCategory())
                && (request.incidentNumber() == null || request.incidentNumber().isBlank())) {
            throw new BusinessValidationException("Incident number is required for an Incident RCA");
        }
        if ("Other".equals(request.detectionPoint())
                && (request.detectionPointDetail() == null || request.detectionPointDetail().isBlank())) {
            throw new BusinessValidationException("Detection point detail is required when Other is selected");
        }
        if ("Pending Review".equals(request.rcaStatus())
                && (request.reviewType() == null || request.reviewType().isBlank())) {
            throw new BusinessValidationException("Review type is required for Pending Review");
        }
        if ("Closed".equals(request.rcaStatus())) {
            throw new BusinessValidationException("Only an administrator can set an RCA to Closed");
        }
        if ((request.rootCauseIssues() == null || request.rootCauseIssues().isEmpty())
                && (request.rootCauseOtherDetail() == null || request.rootCauseOtherDetail().isBlank())) {
            throw new BusinessValidationException("At least one root cause analysis issue is required");
        }
        if (request.incidentStartTime() != null && request.incidentEndTime() != null
                && request.incidentEndTime().isBefore(request.incidentStartTime())) {
            throw new BusinessValidationException(
                    "Incident end time cannot precede incident start time");
        }

        Set<String> teams = new HashSet<>();
        for (TeamActionRequest action : actions(request)) {
            if (!teams.add(action.teamName())) {
                throw new BusinessValidationException(
                        "Only one team action is allowed for team '" + action.teamName() + "'");
            }
        }
        Set<String> requiredTeams = Set.of("Dev", "QA", "RTS", "Program Management", "Release Management");
        if (!teams.equals(requiredTeams)) {
            throw new BusinessValidationException("Learnings and corrective actions are required for all five teams");
        }
    }

    private List<TeamActionRequest> actions(RcaRequest request) {
        return request.teamActions() == null ? List.of() : request.teamActions();
    }

    private RcaResponse toResponse(RcaIncident incident, List<TeamAction> actions) {
        List<TeamActionResponse> actionResponses = actions.stream()
                .map(action -> new TeamActionResponse(
                        action.id(),
                        action.teamName(),
                        action.learnings(),
                        action.correctiveActions(),
                        action.ticketNumber(),
                        action.targetCompletionDate(),
                        action.createdAt(),
                        action.updatedAt()))
                .toList();

        return new RcaResponse(
                incident.id(),
                incident.serialNumber(),
                incident.incidentNumber(),
                incident.incidentMonth(),
                incident.incidentYear(),
                monthYear(incident.incidentMonth(), incident.incidentYear()),
                incident.changeTicket(),
                incident.priority(),
                incident.tower(),
                incident.application(),
                incident.programManager(),
                incident.artTeamName(),
                incident.issueDescription(),
                incident.releaseDatetime(),
                incident.rollbackStatus(),
                incident.incidentStartTime(),
                incident.incidentEndTime(),
                incident.impactedSystem(),
                incident.businessImpact(),
                incident.rootCause(),
                incident.rcaType(),
                incident.remedyUsed(),
                incident.detectionPoint(),
                incident.preventiveActions(),
                incident.rcaStatus(),
                incident.rcaCategory(),
                incident.portfolioName(),
                incident.detectionPointDetail(),
                incident.impactedSystems(),
                incident.resolution(),
                incident.rootCauseIssues(),
                incident.rootCauseOtherDetail(),
                incident.reviewType(),
                incident.createdAt(),
                incident.updatedAt(),
                actionResponses);
    }

    private String monthYear(Integer month, Integer year) {
        if (month == null || year == null) {
            return null;
        }
        return Month.of(month).getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + year;
    }
}
