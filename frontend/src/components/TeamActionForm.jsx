import { TEAM_LABELS } from '../utils/rcaFormData'

export default function TeamActionForm({ action, index, onChange, errors = {} }) {
  const fieldId = (field) => `team-${index}-${field}`

  return (
    <details className="team-action" open={index === 0}>
      <summary>
        <span>{TEAM_LABELS[action.teamName]}</span>
        <small>{action.teamName}</small>
      </summary>
      <div className="team-action-grid">
        <label className="field field-wide" htmlFor={fieldId('learnings')}>
          <span>Learnings / Action Items <b aria-hidden="true">*</b></span>
          <textarea
            id={fieldId('learnings')}
            rows="3"
            value={action.learnings}
            required
            aria-invalid={Boolean(errors.learnings)}
            placeholder="Enter learnings or NA if not applicable"
            onChange={(event) => onChange(index, 'learnings', event.target.value)}
          />
          {errors.learnings && <small className="field-error">{errors.learnings}</small>}
        </label>
        <label className="field field-wide" htmlFor={fieldId('correctiveActions')}>
          <span>Corrective Actions <b aria-hidden="true">*</b></span>
          <textarea
            id={fieldId('correctiveActions')}
            rows="3"
            value={action.correctiveActions}
            required
            aria-invalid={Boolean(errors.correctiveActions)}
            placeholder="Enter corrective actions or NA if not applicable"
            onChange={(event) => onChange(index, 'correctiveActions', event.target.value)}
          />
          {errors.correctiveActions && <small className="field-error">{errors.correctiveActions}</small>}
        </label>
        <label className="field" htmlFor={fieldId('ticketNumber')}>
          <span>JIRA / ServiceNow Ticket Number</span>
          <input
            id={fieldId('ticketNumber')}
            value={action.ticketNumber}
            placeholder="JIRA-1234 or SNO-5678"
            onChange={(event) => onChange(index, 'ticketNumber', event.target.value)}
          />
        </label>
        <label className="field" htmlFor={fieldId('targetCompletionDate')}>
          <span>Target Completion Date</span>
          <input
            id={fieldId('targetCompletionDate')}
            type="date"
            value={action.targetCompletionDate}
            onChange={(event) => onChange(index, 'targetCompletionDate', event.target.value)}
          />
        </label>
      </div>
    </details>
  )
}
