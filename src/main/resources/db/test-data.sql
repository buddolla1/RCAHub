-- Sample data for local development and UI testing.
-- Safe to run more than once; existing sample incidents and team actions are updated.

INSERT INTO rca_incident (
    serial_number,
    incident_number,
    incident_month,
    incident_year,
    change_ticket,
    priority,
    tower,
    application,
    program_manager,
    art_team_name,
    issue_description,
    release_datetime,
    rollback_status,
    incident_start_time,
    incident_end_time,
    impacted_system,
    business_impact,
    root_cause,
    rca_type,
    remedy_used,
    detection_point,
    preventive_actions,
    rca_status
) VALUES
(
    1001, 'TEST-INC-2026-001', 10, 2026, 'CHG-TEST-001', 'P1',
    'Payments', 'Payment Gateway', 'Jordan Lee', 'Payments ART',
    'Payment requests timed out after a database connection pool change.',
    '2026-10-02 20:00:00', 'Completed',
    '2026-10-02 20:15:00', '2026-10-02 21:05:00',
    'Payment API and transaction database',
    'Some customers experienced delayed or failed checkout payments.',
    'The connection pool maximum was lower than peak transaction demand.',
    'Technical',
    'Restored the previous pool configuration and restarted payment services.',
    'Monitoring',
    'Load-test connection pool changes and alert on pool saturation.',
    'Completed'
),
(
    1002, 'TEST-INC-2026-002', 10, 2026, 'CHG-TEST-002', 'P2',
    'Customer Experience', 'Customer Portal', 'Morgan Patel', 'Portal ART',
    'Users received intermittent errors when loading account history.',
    '2026-10-06 18:30:00', 'In Progress',
    '2026-10-06 18:42:00', '2026-10-06 19:20:00',
    'Customer Portal account history',
    'Account history was unavailable to a subset of portal users.',
    'A cache invalidation change caused requests to reach an overloaded service.',
    'Both',
    'Rolled back the cache change and increased service capacity.',
    'Customer',
    'Add staged rollout checks and capacity alerts for account-history traffic.',
    'In Progress'
),
(
    1003, 'TEST-INC-2026-003', 10, 2026, 'CHG-TEST-003', 'P3',
    'Data Platform', 'Reporting Service', 'Taylor Kim', 'Data ART',
    'Daily reports were generated later than their scheduled delivery time.',
    '2026-10-09 01:00:00', 'Not Required',
    '2026-10-09 02:10:00', '2026-10-09 02:48:00',
    'Reporting batch pipeline',
    'Internal teams received daily reports approximately 40 minutes late.',
    'The batch job retried an unavailable upstream dependency without backoff.',
    'Process',
    'Restarted the batch after the upstream dependency recovered.',
    'Monitoring',
    'Introduce bounded retries with backoff and alert on missed delivery windows.',
    'Open'
)
ON DUPLICATE KEY UPDATE
    serial_number = VALUES(serial_number),
    incident_month = VALUES(incident_month),
    incident_year = VALUES(incident_year),
    change_ticket = VALUES(change_ticket),
    priority = VALUES(priority),
    tower = VALUES(tower),
    application = VALUES(application),
    program_manager = VALUES(program_manager),
    art_team_name = VALUES(art_team_name),
    issue_description = VALUES(issue_description),
    release_datetime = VALUES(release_datetime),
    rollback_status = VALUES(rollback_status),
    incident_start_time = VALUES(incident_start_time),
    incident_end_time = VALUES(incident_end_time),
    impacted_system = VALUES(impacted_system),
    business_impact = VALUES(business_impact),
    root_cause = VALUES(root_cause),
    rca_type = VALUES(rca_type),
    remedy_used = VALUES(remedy_used),
    detection_point = VALUES(detection_point),
    preventive_actions = VALUES(preventive_actions),
    rca_status = VALUES(rca_status);

INSERT INTO rca_team_action (
    rca_incident_id,
    team_name,
    learnings,
    corrective_actions,
    target_completion_date
)
SELECT id, 'Dev',
       'Connection pool sizing must be validated against expected peak load.',
       'Add a load test for the payment connection pool to the release pipeline.',
       '2026-10-23'
FROM rca_incident
WHERE incident_number = 'TEST-INC-2026-001'
ON DUPLICATE KEY UPDATE
    learnings = VALUES(learnings),
    corrective_actions = VALUES(corrective_actions),
    target_completion_date = VALUES(target_completion_date);

INSERT INTO rca_team_action (
    rca_incident_id,
    team_name,
    learnings,
    corrective_actions,
    target_completion_date
)
SELECT id, 'QA',
       'Peak-volume scenarios expose connection pool limits before production.',
       'Add peak-volume and connection saturation checks to regression testing.',
       '2026-10-30'
FROM rca_incident
WHERE incident_number = 'TEST-INC-2026-001'
ON DUPLICATE KEY UPDATE
    learnings = VALUES(learnings),
    corrective_actions = VALUES(corrective_actions),
    target_completion_date = VALUES(target_completion_date);

INSERT INTO rca_team_action (
    rca_incident_id,
    team_name,
    learnings,
    corrective_actions,
    target_completion_date
)
SELECT id, 'Dev',
       'Cache changes should be monitored during rollout for downstream traffic spikes.',
       'Add cache rollout metrics and a staged deployment safeguard.',
       '2026-10-27'
FROM rca_incident
WHERE incident_number = 'TEST-INC-2026-002'
ON DUPLICATE KEY UPDATE
    learnings = VALUES(learnings),
    corrective_actions = VALUES(corrective_actions),
    target_completion_date = VALUES(target_completion_date);

INSERT INTO rca_team_action (
    rca_incident_id,
    team_name,
    learnings,
    corrective_actions,
    target_completion_date
)
SELECT id, 'RTS',
       'Retrying without backoff can amplify pressure on a recovering dependency.',
       'Configure bounded retries with exponential backoff and alerting.',
       '2026-11-06'
FROM rca_incident
WHERE incident_number = 'TEST-INC-2026-003'
ON DUPLICATE KEY UPDATE
    learnings = VALUES(learnings),
    corrective_actions = VALUES(corrective_actions),
    target_completion_date = VALUES(target_completion_date);
