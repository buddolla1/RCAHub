package com.syf.rcahub.repository;

import com.syf.rcahub.dto.TeamActionRequest;
import com.syf.rcahub.mapper.TeamActionRowMapper;
import com.syf.rcahub.model.TeamAction;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class TeamActionRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final TeamActionRowMapper rowMapper;

    public TeamActionRepository(NamedParameterJdbcTemplate jdbcTemplate, TeamActionRowMapper rowMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.rowMapper = rowMapper;
    }

    public List<TeamAction> findByIncidentId(long incidentId) {
        String sql = """
                SELECT id, rca_incident_id, team_name, learnings, corrective_actions,
                       target_completion_date, created_at, updated_at
                FROM rca_team_action
                WHERE rca_incident_id = :incidentId
                ORDER BY FIELD(team_name, 'Dev', 'QA', 'RTS', 'Program Management', 'Release Management')
                """;
        return jdbcTemplate.query(sql, Map.of("incidentId", incidentId), rowMapper);
    }

    public void replaceAll(long incidentId, List<TeamActionRequest> actions) {
        jdbcTemplate.update(
                "DELETE FROM rca_team_action WHERE rca_incident_id = :incidentId",
                Map.of("incidentId", incidentId));
        if (actions.isEmpty()) {
            return;
        }

        String sql = """
                INSERT INTO rca_team_action (
                    rca_incident_id, team_name, learnings, corrective_actions, target_completion_date
                ) VALUES (
                    :incidentId, :teamName, :learnings, :correctiveActions, :targetCompletionDate
                )
                """;
        MapSqlParameterSource[] batch = actions.stream()
                .map(action -> new MapSqlParameterSource()
                        .addValue("incidentId", incidentId)
                        .addValue("teamName", action.teamName())
                        .addValue("learnings", action.learnings())
                        .addValue("correctiveActions", action.correctiveActions())
                        .addValue("targetCompletionDate", action.targetCompletionDate()))
                .toArray(MapSqlParameterSource[]::new);
        jdbcTemplate.batchUpdate(sql, batch);
    }
}
