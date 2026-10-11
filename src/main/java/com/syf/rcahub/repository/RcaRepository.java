package com.syf.rcahub.repository;

import com.syf.rcahub.dto.RcaRequest;
import com.syf.rcahub.dto.RcaSearchCriteria;
import com.syf.rcahub.mapper.RcaRowMapper;
import com.syf.rcahub.model.RcaIncident;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class RcaRepository {

    private static final String COLUMNS = """
            id, serial_number, incident_number, incident_month, incident_year, change_ticket,
            priority, tower, application, program_manager, art_team_name, issue_description,
            release_datetime, rollback_status, incident_start_time, incident_end_time,
            impacted_system, business_impact, root_cause, rca_type, remedy_used, detection_point,
            preventive_actions, rca_status, created_at, updated_at
            """;

    private static final Map<String, String> SORT_COLUMNS = Map.ofEntries(
            Map.entry("incidentNumber", "incident_number"),
            Map.entry("priority", "priority"),
            Map.entry("application", "application"),
            Map.entry("artTeamName", "art_team_name"),
            Map.entry("releaseDatetime", "release_datetime"),
            Map.entry("rollbackStatus", "rollback_status"),
            Map.entry("rcaStatus", "rca_status"),
            Map.entry("createdAt", "created_at"),
            Map.entry("updatedAt", "updated_at"));

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final RcaRowMapper rowMapper;

    public RcaRepository(NamedParameterJdbcTemplate jdbcTemplate, RcaRowMapper rowMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.rowMapper = rowMapper;
    }

    public long insert(RcaRequest request) {
        String sql = """
                INSERT INTO rca_incident (
                    serial_number, incident_number, incident_month, incident_year, change_ticket,
                    priority, tower, application, program_manager, art_team_name, issue_description,
                    release_datetime, rollback_status, incident_start_time, incident_end_time,
                    impacted_system, business_impact, root_cause, rca_type, remedy_used,
                    detection_point, preventive_actions, rca_status
                ) VALUES (
                    :serialNumber, :incidentNumber, :incidentMonth, :incidentYear, :changeTicket,
                    :priority, :tower, :application, :programManager, :artTeamName, :issueDescription,
                    :releaseDatetime, :rollbackStatus, :incidentStartTime, :incidentEndTime,
                    :impactedSystem, :businessImpact, :rootCause, :rcaType, :remedyUsed,
                    :detectionPoint, :preventiveActions, :rcaStatus
                )
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(sql, parameters(request), keyHolder, new String[]{"id"});
        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("Database did not return an RCA identifier");
        }
        return key.longValue();
    }

    public int update(long id, RcaRequest request) {
        String sql = """
                UPDATE rca_incident SET
                    serial_number = :serialNumber,
                    incident_number = :incidentNumber,
                    incident_month = :incidentMonth,
                    incident_year = :incidentYear,
                    change_ticket = :changeTicket,
                    priority = :priority,
                    tower = :tower,
                    application = :application,
                    program_manager = :programManager,
                    art_team_name = :artTeamName,
                    issue_description = :issueDescription,
                    release_datetime = :releaseDatetime,
                    rollback_status = :rollbackStatus,
                    incident_start_time = :incidentStartTime,
                    incident_end_time = :incidentEndTime,
                    impacted_system = :impactedSystem,
                    business_impact = :businessImpact,
                    root_cause = :rootCause,
                    rca_type = :rcaType,
                    remedy_used = :remedyUsed,
                    detection_point = :detectionPoint,
                    preventive_actions = :preventiveActions,
                    rca_status = :rcaStatus
                WHERE id = :id
                """;
        return jdbcTemplate.update(sql, parameters(request).addValue("id", id));
    }

    public Optional<RcaIncident> findById(long id) {
        String sql = "SELECT " + COLUMNS + " FROM rca_incident WHERE id = :id";
        return jdbcTemplate.query(sql, Map.of("id", id), rowMapper).stream().findFirst();
    }

    public boolean existsByIncidentNumber(String incidentNumber, Long excludedId) {
        StringBuilder sql = new StringBuilder(
                "SELECT COUNT(*) FROM rca_incident WHERE incident_number = :incidentNumber");
        MapSqlParameterSource params = new MapSqlParameterSource("incidentNumber", incidentNumber);
        if (excludedId != null) {
            sql.append(" AND id <> :excludedId");
            params.addValue("excludedId", excludedId);
        }
        Long count = jdbcTemplate.queryForObject(sql.toString(), params, Long.class);
        return count != null && count > 0;
    }

    public List<RcaIncident> findAll(RcaSearchCriteria criteria) {
        QueryParts query = filteredQuery(criteria);
        String sortColumn = SORT_COLUMNS.getOrDefault(criteria.sortBy(), "created_at");
        String direction = "asc".equalsIgnoreCase(criteria.sortDirection()) ? "ASC" : "DESC";
        String sql = "SELECT " + COLUMNS + " FROM rca_incident" + query.whereClause()
                + " ORDER BY " + sortColumn + " " + direction + ", id " + direction
                + " LIMIT :limit OFFSET :offset";
        query.parameters()
                .addValue("limit", criteria.size())
                .addValue("offset", (long) criteria.page() * criteria.size());
        return jdbcTemplate.query(sql, query.parameters(), rowMapper);
    }

    public long count(RcaSearchCriteria criteria) {
        QueryParts query = filteredQuery(criteria);
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM rca_incident" + query.whereClause(),
                query.parameters(),
                Long.class);
        return count == null ? 0 : count;
    }

    public int deleteById(long id) {
        return jdbcTemplate.update("DELETE FROM rca_incident WHERE id = :id", Map.of("id", id));
    }

    private QueryParts filteredQuery(RcaSearchCriteria criteria) {
        StringBuilder where = new StringBuilder(" WHERE 1 = 1");
        MapSqlParameterSource params = new MapSqlParameterSource();
        addContainsFilter(where, params, "incident_number", "incidentNumber", criteria.incidentNumber());
        addExactFilter(where, params, "priority", "priority", criteria.priority());
        addExactFilter(where, params, "application", "application", criteria.application());
        addExactFilter(where, params, "rca_status", "rcaStatus", criteria.rcaStatus());
        if (criteria.month() != null) {
            where.append(" AND incident_month = :month");
            params.addValue("month", criteria.month());
        }
        if (criteria.year() != null) {
            where.append(" AND incident_year = :year");
            params.addValue("year", criteria.year());
        }
        return new QueryParts(where.toString(), params);
    }

    private void addContainsFilter(StringBuilder where, MapSqlParameterSource params,
                                   String column, String parameter, String value) {
        if (value != null && !value.isBlank()) {
            where.append(" AND LOWER(").append(column).append(") LIKE :").append(parameter);
            params.addValue(parameter, "%" + value.trim().toLowerCase() + "%");
        }
    }

    private void addExactFilter(StringBuilder where, MapSqlParameterSource params,
                                String column, String parameter, String value) {
        if (value != null && !value.isBlank()) {
            where.append(" AND ").append(column).append(" = :").append(parameter);
            params.addValue(parameter, value.trim());
        }
    }

    private MapSqlParameterSource parameters(RcaRequest request) {
        return new MapSqlParameterSource()
                .addValue("serialNumber", request.serialNumber())
                .addValue("incidentNumber", request.incidentNumber().trim())
                .addValue("incidentMonth", request.incidentMonth())
                .addValue("incidentYear", request.incidentYear())
                .addValue("changeTicket", request.changeTicket())
                .addValue("priority", request.priority())
                .addValue("tower", request.tower())
                .addValue("application", request.application())
                .addValue("programManager", request.programManager())
                .addValue("artTeamName", request.artTeamName())
                .addValue("issueDescription", request.issueDescription().trim())
                .addValue("releaseDatetime", request.releaseDatetime())
                .addValue("rollbackStatus", request.rollbackStatus())
                .addValue("incidentStartTime", request.incidentStartTime())
                .addValue("incidentEndTime", request.incidentEndTime())
                .addValue("impactedSystem", request.impactedSystem())
                .addValue("businessImpact", request.businessImpact())
                .addValue("rootCause", request.rootCause())
                .addValue("rcaType", request.rcaType())
                .addValue("remedyUsed", request.remedyUsed())
                .addValue("detectionPoint", request.detectionPoint())
                .addValue("preventiveActions", request.preventiveActions())
                .addValue("rcaStatus", request.rcaStatus());
    }

    private record QueryParts(String whereClause, MapSqlParameterSource parameters) {
    }
}
