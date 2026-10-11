import { TEAM_LABELS } from '../utils/rcaFormData'

export default function TeamActionForm({ action, index, onChange }) {
  const fieldId = (field) => `team-${index}-${field}`

  return (
    <details className="team-action" open={index === 0}>
      <summary>
        <span>{TEAM_LABELS[action.teamName]}</span>
        <small>{action.teamName}</small>
      </summary>
      <div className="team-action-grid">
        <label className="field field-wide" htmlFor={fieldId('learnings')}>
          <span>Learnings</span>
          <textarea
            id={fieldId('learnings')}
            rows="3"
            value={action.learnings}
            onChange={(event) => onChange(index, 'learnings', event.target.value)}
          />
        </label>
        <label className="field field-wide" htmlFor={fieldId('correctiveActions')}>
          <span>Corrective Actions</span>
          <textarea
            id={fieldId('correctiveActions')}
            rows="3"
            value={action.correctiveActions}
            onChange={(event) => onChange(index, 'correctiveActions', event.target.value)}
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
