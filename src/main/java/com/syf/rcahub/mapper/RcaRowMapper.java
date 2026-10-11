package com.syf.rcahub.mapper;

import com.syf.rcahub.model.RcaIncident;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;

@Component
public class RcaRowMapper implements RowMapper<RcaIncident> {

    @Override
    public RcaIncident mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new RcaIncident(
                rs.getLong("id"),
                getNullableLong(rs, "serial_number"),
                rs.getString("incident_number"),
                getNullableInteger(rs, "incident_month"),
                getNullableInteger(rs, "incident_year"),
                rs.getString("change_ticket"),
                rs.getString("priority"),
                rs.getString("tower"),
                rs.getString("application"),
                rs.getString("program_manager"),
                rs.getString("art_team_name"),
                rs.getString("issue_description"),
                rs.getObject("release_datetime", LocalDateTime.class),
                rs.getString("rollback_status"),
                rs.getObject("incident_start_time", LocalDateTime.class),
                rs.getObject("incident_end_time", LocalDateTime.class),
                rs.getString("impacted_system"),
                rs.getString("business_impact"),
                rs.getString("root_cause"),
                rs.getString("rca_type"),
                rs.getString("remedy_used"),
                rs.getString("detection_point"),
                rs.getString("preventive_actions"),
                rs.getString("rca_status"),
                rs.getObject("created_at", LocalDateTime.class),
                rs.getObject("updated_at", LocalDateTime.class));
    }

    private Long getNullableLong(ResultSet rs, String column) throws SQLException {
        long value = rs.getLong(column);
        return rs.wasNull() ? null : value;
    }

    private Integer getNullableInteger(ResultSet rs, String column) throws SQLException {
        int value = rs.getInt(column);
        return rs.wasNull() ? null : value;
    }
}
