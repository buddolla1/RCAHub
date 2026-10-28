package com.syf.rcahub.mapper;

import com.syf.rcahub.model.TeamAction;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class TeamActionRowMapper implements RowMapper<TeamAction> {

    @Override
    public TeamAction mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new TeamAction(
                rs.getLong("id"),
                rs.getLong("rca_incident_id"),
                rs.getString("team_name"),
                rs.getString("learnings"),
                rs.getString("corrective_actions"),
                rs.getString("ticket_number"),
                rs.getObject("target_completion_date", LocalDate.class),
                rs.getObject("created_at", LocalDateTime.class),
                rs.getObject("updated_at", LocalDateTime.class));
    }
}
