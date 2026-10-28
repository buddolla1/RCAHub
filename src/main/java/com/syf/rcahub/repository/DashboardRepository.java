package com.syf.rcahub.repository;

import com.syf.rcahub.dto.CountMetric;
import com.syf.rcahub.dto.DashboardResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class DashboardRepository {

    private final JdbcTemplate jdbcTemplate;

    public DashboardRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public DashboardResponse getSummary() {
        Totals totals = jdbcTemplate.queryForObject("""
                SELECT
                    COUNT(*) AS total_rcas,
                    COALESCE(SUM(rollback_status = 'Completed'), 0) AS completed_rollbacks,
                    COALESCE(SUM(rca_status = 'Open'), 0) AS open_rcas,
                    COALESCE(SUM(rca_status = 'In Progress'), 0) AS in_progress_rcas,
                    COALESCE(SUM(rca_status IN ('Closed', 'Completed')), 0) AS completed_rcas
                FROM rca_incident
                """, (rs, rowNum) -> new Totals(
                rs.getLong("total_rcas"),
                rs.getLong("completed_rollbacks"),
                rs.getLong("open_rcas"),
                rs.getLong("in_progress_rcas"),
                rs.getLong("completed_rcas")));

        if (totals == null) {
            totals = new Totals(0, 0, 0, 0, 0);
        }

        return new DashboardResponse(
                totals.totalRcas(),
                totals.completedRollbacks(),
                totals.openRcas(),
                totals.inProgressRcas(),
                totals.completedRcas(),
                countBy("priority", "priority", "count_value DESC, label ASC", 0),
                countByMonth(),
                countBy("application", "application", "count_value DESC, label ASC", 10),
                countBy("rollback_status", "rollback_status", "count_value DESC, label ASC", 0));
    }

    private List<CountMetric> countBy(String column, String labelExpression, String orderBy, int limit) {
        String sql = "SELECT " + labelExpression + " AS label, COUNT(*) AS count_value "
                + "FROM rca_incident WHERE " + column + " IS NOT NULL AND TRIM(" + column + ") <> '' "
                + "GROUP BY " + column + " ORDER BY " + orderBy
                + (limit > 0 ? " LIMIT " + limit : "");
        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new CountMetric(rs.getString("label"), rs.getLong("count_value")));
    }

    private List<CountMetric> countByMonth() {
        return jdbcTemplate.query("""
                SELECT
                    CONCAT(MONTHNAME(STR_TO_DATE(CONCAT(incident_year, '-', incident_month, '-01'), '%Y-%m-%d')),
                           ' ', incident_year) AS label,
                    COUNT(*) AS count_value
                FROM rca_incident
                WHERE incident_month IS NOT NULL AND incident_year IS NOT NULL
                GROUP BY incident_year, incident_month
                ORDER BY incident_year ASC, incident_month ASC
                """, (rs, rowNum) ->
                new CountMetric(rs.getString("label"), rs.getLong("count_value")));
    }

    private record Totals(
            long totalRcas,
            long completedRollbacks,
            long openRcas,
            long inProgressRcas,
            long completedRcas) {
    }
}
