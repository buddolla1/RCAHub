import { RotateCcw, Save, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MONTHS, emptyRca, toApiPayload } from '../utils/rcaFormData'
import TeamActionForm from './TeamActionForm'

const priorityOptions = ['P1', 'P2', 'P3', 'P4']
const rollbackOptions = ['Not Required', 'Planned', 'In Progress', 'Completed', 'Failed']
const rcaTypeOptions = ['Technical', 'Process', 'Both']
const detectionOptions = ['Monitoring', 'Customer', 'Other']
const statusOptions = ['Open', 'In Progress', 'Completed']

function SelectField({ id, label, options, value, onChange, error, required = false }) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      <select id={id} value={value} onChange={onChange} aria-invalid={Boolean(error)} required={required}>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label
          return <option key={value} value={value}>{optionLabel}</option>
        })}
      </select>
      {error && <small className="field-error">{error}</small>}
    </label>
  )
}

export default function RcaForm({ initialData, onSubmit, submitLabel, submitting, apiFieldErrors = {} }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialData || emptyRca())
  const [errors, setErrors] = useState({})
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setForm(initialData || emptyRca())
    setDirty(false)
  }, [initialData])

  useEffect(() => {
    const warnOnExit = (event) => {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnOnExit)
    return () => window.removeEventListener('beforeunload', warnOnExit)
  }, [dirty])

  const monthYear = useMemo(() => {
    if (!form.incidentMonth || !form.incidentYear) return 'Select month and year'
    return `${MONTHS[Number(form.incidentMonth) - 1]} ${form.incidentYear}`
  }, [form.incidentMonth, form.incidentYear])

  const changeField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setDirty(true)
  }

  const changeTeamAction = (index, field, value) => {
    setForm((current) => ({
      ...current,
      teamActions: current.teamActions.map((action, actionIndex) =>
        actionIndex === index ? { ...action, [field]: value } : action),
    }))
    setDirty(true)
  }

  const validate = () => {
    const next = {}
    if (!form.incidentNumber.trim()) next.incidentNumber = 'Incident number is required'
    if (!form.issueDescription.trim()) next.issueDescription = 'Issue description is required'
    if (!form.rcaStatus) next.rcaStatus = 'RCA status is required'
    if (form.incidentStartTime && form.incidentEndTime
      && form.incidentEndTime < form.incidentStartTime) {
      next.incidentEndTime = 'Incident end time cannot precede the start time'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!validate()) {
      document.querySelector('[aria-invalid="true"]')?.focus()
      return
    }
    const saved = await onSubmit(toApiPayload(form))
    if (saved) setDirty(false)
  }

  const cancel = () => {
    if (!dirty || window.confirm('Discard your unsaved changes?')) navigate(-1)
  }

  const reset = () => {
    if (!dirty || window.confirm('Reset all fields to their original values?')) {
      setForm(initialData || emptyRca())
      setErrors({})
      setDirty(false)
    }
  }

  const errorFor = (field) => errors[field] || apiFieldErrors[field]

  return (
    <form className="rca-form" onSubmit={submit} noValidate>
      <section className="form-section">
        <div className="section-heading">
          <span>01</span>
          <div><h2>Incident Details</h2><p>Core incident identification and ownership.</p></div>
        </div>
        <div className="form-grid">
          <label className="field" htmlFor="serialNumber">
            <span>S. No.</span>
            <input id="serialNumber" type="number" min="1" value={form.serialNumber}
              onChange={(event) => changeField('serialNumber', event.target.value)} />
          </label>
          <SelectField id="incidentMonth" label="Month" options={MONTHS.map((month, index) => ({ value: index + 1, label: month }))}
            value={form.incidentMonth} onChange={(event) => changeField('incidentMonth', event.target.value)} />
          <label className="field" htmlFor="incidentYear">
            <span>Year</span>
            <input id="incidentYear" type="number" min="2000" max="9999" value={form.incidentYear}
              onChange={(event) => changeField('incidentYear', event.target.value)} />
          </label>
          <label className="field" htmlFor="monthYear">
            <span>Month - Year</span>
            <input id="monthYear" value={monthYear} readOnly className="derived-input" />
          </label>
          <label className="field" htmlFor="incidentNumber">
            <span>Incident Number <b aria-hidden="true">*</b></span>
            <input id="incidentNumber" value={form.incidentNumber} required
              aria-invalid={Boolean(errorFor('incidentNumber'))}
              onChange={(event) => changeField('incidentNumber', event.target.value)} />
            {errorFor('incidentNumber') && <small className="field-error">{errorFor('incidentNumber')}</small>}
          </label>
          <label className="field" htmlFor="changeTicket">
            <span>Change Ticket Caused Incident</span>
            <input id="changeTicket" value={form.changeTicket}
              onChange={(event) => changeField('changeTicket', event.target.value)} />
          </label>
          <SelectField id="priority" label="Priority" options={priorityOptions} value={form.priority}
            onChange={(event) => changeField('priority', event.target.value)} />
          {['tower', 'application', 'programManager', 'artTeamName'].map((field) => (
            <label className="field" htmlFor={field} key={field}>
              <span>{{ tower: 'Tower', application: 'Application', programManager: 'Program Manager', artTeamName: 'ART Team Name' }[field]}</span>
              <input id={field} value={form[field]}
                onChange={(event) => changeField(field, event.target.value)} />
            </label>
          ))}
          <label className="field field-wide" htmlFor="issueDescription">
            <span>Issue Description <b aria-hidden="true">*</b></span>
            <textarea id="issueDescription" rows="4" value={form.issueDescription} required
              aria-invalid={Boolean(errorFor('issueDescription'))}
              onChange={(event) => changeField('issueDescription', event.target.value)} />
            {errorFor('issueDescription') && <small className="field-error">{errorFor('issueDescription')}</small>}
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="section-heading">
          <span>02</span>
          <div><h2>Release and Impact</h2><p>Timeline, rollback state, and business exposure.</p></div>
        </div>
        <div className="form-grid">
          {[['releaseDatetime', 'Release Date and Time'], ['incidentStartTime', 'Incident Start Time'],
            ['incidentEndTime', 'Incident End Time']].map(([field, label]) => (
            <label className="field" htmlFor={field} key={field}>
              <span>{label}</span>
              <input id={field} type="datetime-local" value={form[field]}
                aria-invalid={Boolean(errorFor(field))}
                onChange={(event) => changeField(field, event.target.value)} />
              {errorFor(field) && <small className="field-error">{errorFor(field)}</small>}
            </label>
          ))}
          <SelectField id="rollbackStatus" label="Release Rollback Status" options={rollbackOptions}
            value={form.rollbackStatus} onChange={(event) => changeField('rollbackStatus', event.target.value)} />
          <label className="field field-wide" htmlFor="impactedSystem">
            <span>Impacted System</span>
            <input id="impactedSystem" value={form.impactedSystem}
              onChange={(event) => changeField('impactedSystem', event.target.value)} />
          </label>
          <label className="field field-wide" htmlFor="businessImpact">
            <span>Customer / Business Impact</span>
            <textarea id="businessImpact" rows="4" value={form.businessImpact}
              onChange={(event) => changeField('businessImpact', event.target.value)} />
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="section-heading">
          <span>03</span>
          <div><h2>Root Cause Analysis</h2><p>Diagnosis, remediation, detection, and prevention.</p></div>
        </div>
        <div className="form-grid">
          <label className="field field-wide" htmlFor="rootCause">
            <span>Root Cause</span>
            <textarea id="rootCause" rows="4" value={form.rootCause}
              onChange={(event) => changeField('rootCause', event.target.value)} />
          </label>
          <SelectField id="rcaType" label="RCA Type" options={rcaTypeOptions} value={form.rcaType}
            onChange={(event) => changeField('rcaType', event.target.value)} />
          <SelectField id="detectionPoint" label="Detection Point" options={detectionOptions}
            value={form.detectionPoint} onChange={(event) => changeField('detectionPoint', event.target.value)} />
          <label className="field field-wide" htmlFor="remedyUsed">
            <span>Remedy Used</span>
            <textarea id="remedyUsed" rows="3" value={form.remedyUsed}
              onChange={(event) => changeField('remedyUsed', event.target.value)} />
          </label>
          <label className="field field-wide" htmlFor="preventiveActions">
            <span>Preventive Actions &amp; Next Steps</span>
            <textarea id="preventiveActions" rows="4" value={form.preventiveActions}
              onChange={(event) => changeField('preventiveActions', event.target.value)} />
          </label>
          <SelectField id="rcaStatus" label="RCA Status" options={statusOptions} value={form.rcaStatus}
            onChange={(event) => changeField('rcaStatus', event.target.value)}
            error={errorFor('rcaStatus')} required />
        </div>
      </section>

      <section className="form-section">
        <div className="section-heading">
          <span>04</span>
          <div><h2>Team Learnings and Corrective Actions</h2><p>Capture ownership and follow-through for every delivery group.</p></div>
        </div>
        <div className="team-actions">
          {form.teamActions.map((action, index) => (
            <TeamActionForm key={action.teamName} action={action} index={index} onChange={changeTeamAction} />
          ))}
        </div>
      </section>

      <div className="form-actions">
        <button type="button" className="button button-ghost" onClick={cancel}>
          <X size={17} /> Cancel
        </button>
        <button type="button" className="button button-secondary" onClick={reset}>
          <RotateCcw size={17} /> Reset Form
        </button>
        <button type="submit" className="button button-primary" disabled={submitting}>
          {submitting ? <span className="button-spinner" /> : <Save size={17} />}
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
