import { RotateCcw, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROOT_CAUSE_ISSUES, emptyRca, toApiPayload } from '../utils/rcaFormData'
import TeamActionForm from './TeamActionForm'

const categoryOptions = ['Incident', 'Rollback', 'Emergency Fix']
const portfolioOptions = ['ABO']
const priorityOptions = [
  { value: 'P1', label: 'P1 - Critical' },
  { value: 'P2', label: 'P2 - High' },
  { value: 'P3', label: 'P3 - Medium' },
  { value: 'P4', label: 'P4 - Low' },
]
const detectionOptions = ['Monitoring', 'Customer', 'Manual', 'Other']
const statusOptions = ['Open', 'In Progress', 'Pending Review', 'Request Closure']
const reviewOptions = ['Reviewer: ART team', 'Reviewer: SRE/Release mgmt']

function SelectField({ id, label, options, value, onChange, error, required = false }) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      <select id={id} value={value} onChange={onChange} aria-invalid={Boolean(error)} required={required}>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label
          return <option key={optionValue} value={optionValue}>{optionLabel}</option>
        })}
      </select>
      {error && <small className="field-error">{error}</small>}
    </label>
  )
}

function TextField({ id, label, value, onChange, error, required = false, type = 'text', placeholder = '' }) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      <input id={id} type={type} value={value} onChange={onChange} aria-invalid={Boolean(error)}
        required={required} placeholder={placeholder} />
      {error && <small className="field-error">{error}</small>}
    </label>
  )
}

function TextAreaField({ id, label, value, onChange, error, required = false, rows = 4 }) {
  return (
    <label className="field field-wide" htmlFor={id}>
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      <textarea id={id} rows={rows} value={value} onChange={onChange} aria-invalid={Boolean(error)} required={required} />
      {error && <small className="field-error">{error}</small>}
    </label>
  )
}

export default function RcaForm({ initialData, onSubmit, submitLabel, submitting, apiFieldErrors = {} }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialData || emptyRca())
  const [errors, setErrors] = useState({})
  const [dirty, setDirty] = useState(false)
  const [otherDialogOpen, setOtherDialogOpen] = useState(false)
  const [otherDetail, setOtherDetail] = useState('')
  const [otherDetailError, setOtherDetailError] = useState('')
  const [otherSuccess, setOtherSuccess] = useState(false)

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

  const changeField = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value }
      if (field === 'rcaCategory' && value !== 'Incident') next.incidentNumber = ''
      if (field === 'detectionPoint' && value !== 'Other') next.detectionPointDetail = ''
      if (field === 'rcaStatus' && value !== 'Pending Review') next.reviewType = ''
      return next
    })
    setErrors((current) => ({ ...current, [field]: undefined }))
    setDirty(true)
  }

  const changeTeamAction = (index, field, value) => {
    setForm((current) => ({
      ...current,
      teamActions: current.teamActions.map((action, actionIndex) =>
        actionIndex === index ? { ...action, [field]: value } : action),
    }))
    setErrors((current) => ({
      ...current,
      teamActions: { ...current.teamActions, [index]: { ...current.teamActions?.[index], [field]: undefined } },
    }))
    setDirty(true)
  }

  const toggleRootCauseIssue = (issue) => {
    setForm((current) => ({
      ...current,
      rootCauseIssues: current.rootCauseIssues.includes(issue)
        ? current.rootCauseIssues.filter((selected) => selected !== issue)
        : [...current.rootCauseIssues, issue],
    }))
    setErrors((current) => ({ ...current, rootCauseIssues: undefined }))
    setDirty(true)
  }

  const openOtherDialog = () => {
    setOtherDetail(form.rootCauseOtherDetail || '')
    setOtherDetailError('')
    setOtherDialogOpen(true)
  }

  const saveOtherDetail = () => {
    if (!otherDetail.trim()) {
      setOtherDetailError('Category details are required')
      return
    }
    changeField('rootCauseOtherDetail', otherDetail.trim())
    setOtherDialogOpen(false)
    setOtherSuccess(true)
  }

  const validate = () => {
    const next = {}
    const requiredFields = {
      rcaCategory: 'RCA category is required',
      application: 'Application name is required',
      portfolioName: 'Portfolio name is required',
      artTeamName: 'ART team name is required',
      programManager: 'Program manager is required',
      changeTicket: 'Change number is required',
      incidentStartTime: 'Start time is required',
      incidentEndTime: 'End time is required',
      priority: 'Severity / priority is required',
      detectionPoint: 'Detection point is required',
      impactedSystems: 'Impacted systems / services are required',
      issueDescription: 'Issue description is required',
      businessImpact: 'Customer / business impact is required',
      resolution: 'Resolution is required',
      rcaStatus: 'RCA status is required',
    }
    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!String(form[field] || '').trim()) next[field] = message
    })
    if (form.rcaCategory === 'Incident' && !form.incidentNumber.trim()) {
      next.incidentNumber = 'Incident number is required for an Incident RCA'
    }
    if (form.detectionPoint === 'Other' && !form.detectionPointDetail.trim()) {
      next.detectionPointDetail = 'Detection point details are required when Other is selected'
    }
    if (form.rcaStatus === 'Pending Review' && !form.reviewType) {
      next.reviewType = 'Review type is required for Pending Review'
    }
    if (form.rootCauseIssues.length === 0 && !form.rootCauseOtherDetail.trim()) {
      next.rootCauseIssues = 'Select at least one root cause analysis issue'
    }
    if (form.incidentStartTime && form.incidentEndTime && form.incidentEndTime < form.incidentStartTime) {
      next.incidentEndTime = 'End time cannot precede the start time'
    }
    next.teamActions = {}
    form.teamActions.forEach((action, index) => {
      const actionErrors = {}
      if (!action.learnings.trim()) actionErrors.learnings = 'Learnings / action items are required; enter NA if not applicable'
      if (!action.correctiveActions.trim()) actionErrors.correctiveActions = 'Corrective actions are required; enter NA if not applicable'
      if (Object.keys(actionErrors).length) next.teamActions[index] = actionErrors
    })
    if (Object.keys(next.teamActions).length === 0) delete next.teamActions
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
      setOtherSuccess(false)
      setDirty(false)
    }
  }

  const errorFor = (field) => errors[field] || apiFieldErrors[field]

  return (
    <form className="rca-form" onSubmit={submit} noValidate>
      <section className="form-section">
        <div className="section-heading">
          <span>01</span>
          <div><h2>RCA Category &amp; Incident Details</h2><p>Basic information, timeline, severity, detection, and impact.</p></div>
        </div>
        <h3 className="form-subheading">Basic Information</h3>
        <div className="form-grid">
          <SelectField id="rcaCategory" label="RCA Category" options={categoryOptions} value={form.rcaCategory}
            onChange={(event) => changeField('rcaCategory', event.target.value)} error={errorFor('rcaCategory')} required />
          <TextField id="application" label="Application Name" value={form.application}
            onChange={(event) => changeField('application', event.target.value)} error={errorFor('application')} required />
          <SelectField id="portfolioName" label="Portfolio Name" options={portfolioOptions} value={form.portfolioName}
            onChange={(event) => changeField('portfolioName', event.target.value)} error={errorFor('portfolioName')} required />
          {form.rcaCategory === 'Incident' && (
            <TextField id="incidentNumber" label="Incident Number" value={form.incidentNumber}
              onChange={(event) => changeField('incidentNumber', event.target.value)} error={errorFor('incidentNumber')}
              placeholder="INC-2026-001" required />
          )}
        </div>

        <h3 className="form-subheading">Team &amp; Timeline Information</h3>
        <div className="form-grid">
          <TextField id="artTeamName" label="ART Team Name" value={form.artTeamName}
            onChange={(event) => changeField('artTeamName', event.target.value)} error={errorFor('artTeamName')} required />
          <TextField id="programManager" label="Program Manager" value={form.programManager}
            onChange={(event) => changeField('programManager', event.target.value)} error={errorFor('programManager')} required />
          <TextField id="changeTicket" label="Change Number" value={form.changeTicket}
            onChange={(event) => changeField('changeTicket', event.target.value)} error={errorFor('changeTicket')}
            placeholder="CHG-2026-001" required />
          <TextField id="incidentStartTime" label="Start Time" type="datetime-local" value={form.incidentStartTime}
            onChange={(event) => changeField('incidentStartTime', event.target.value)} error={errorFor('incidentStartTime')} required />
          <TextField id="incidentEndTime" label="End Time" type="datetime-local" value={form.incidentEndTime}
            onChange={(event) => changeField('incidentEndTime', event.target.value)} error={errorFor('incidentEndTime')} required />
        </div>

        <h3 className="form-subheading">Severity &amp; Detection</h3>
        <div className="form-grid">
          <SelectField id="priority" label="Severity / Priority" options={priorityOptions} value={form.priority}
            onChange={(event) => changeField('priority', event.target.value)} error={errorFor('priority')} required />
          <SelectField id="detectionPoint" label="Detection Point" options={detectionOptions} value={form.detectionPoint}
            onChange={(event) => changeField('detectionPoint', event.target.value)} error={errorFor('detectionPoint')} required />
          {form.detectionPoint === 'Other' && (
            <TextAreaField id="detectionPointDetail" label="Detection Point Detail" value={form.detectionPointDetail}
              onChange={(event) => changeField('detectionPointDetail', event.target.value)}
              error={errorFor('detectionPointDetail')} required rows={3} />
          )}
        </div>

        <h3 className="form-subheading">Incident Impact &amp; Resolution</h3>
        <div className="form-grid">
          <TextAreaField id="impactedSystems" label="Impacted Systems / Services" value={form.impactedSystems}
            onChange={(event) => changeField('impactedSystems', event.target.value)} error={errorFor('impactedSystems')} required />
          <TextAreaField id="issueDescription" label="Issue Description" value={form.issueDescription}
            onChange={(event) => changeField('issueDescription', event.target.value)} error={errorFor('issueDescription')} required />
          <TextAreaField id="businessImpact" label="Customer / Business Impact" value={form.businessImpact}
            onChange={(event) => changeField('businessImpact', event.target.value)} error={errorFor('businessImpact')} required />
          <TextAreaField id="resolution" label="Resolution" value={form.resolution}
            onChange={(event) => changeField('resolution', event.target.value)} error={errorFor('resolution')} required />
        </div>
      </section>

      <section className="form-section">
        <div className="section-heading">
          <span>02</span>
          <div><h2>RCA Detail</h2><p>Select the contributing issues and manage the RCA workflow.</p></div>
        </div>
        <h3 className="form-subheading">RCA Analysis</h3>
        <fieldset className="checkbox-fieldset" aria-invalid={Boolean(errorFor('rootCauseIssues'))}>
          <legend>Root Cause Analysis Issues <b aria-hidden="true">*</b></legend>
          <div className="checkbox-grid">
            {ROOT_CAUSE_ISSUES.map((issue) => (
              <label className="checkbox-option" key={issue}>
                <input type="checkbox" checked={form.rootCauseIssues.includes(issue)}
                  onChange={() => toggleRootCauseIssue(issue)} />
                <span>{issue}</span>
              </label>
            ))}
            <label className="checkbox-option">
              <input type="checkbox" checked={false} onChange={openOtherDialog} />
              <span>Any Other Category</span>
            </label>
          </div>
          {errorFor('rootCauseIssues') && <small className="field-error">{errorFor('rootCauseIssues')}</small>}
          {otherSuccess && form.rootCauseOtherDetail && (
            <div className="inline-success" role="status">
              Category details submitted. The closure workflow has been triggered.
              <button type="button" onClick={openOtherDialog}>Edit details</button>
            </div>
          )}
        </fieldset>

        <h3 className="form-subheading">RCA Status Management</h3>
        <div className="form-grid">
          <SelectField id="rcaStatus" label="RCA Status" options={statusOptions} value={form.rcaStatus}
            onChange={(event) => changeField('rcaStatus', event.target.value)} error={errorFor('rcaStatus')} required />
          {form.rcaStatus === 'Pending Review' && (
            <SelectField id="reviewType" label="Review Type" options={reviewOptions} value={form.reviewType}
              onChange={(event) => changeField('reviewType', event.target.value)} error={errorFor('reviewType')} required />
          )}
        </div>
        <p className="workflow-note">Request Closure starts the admin approval workflow. Closed is reserved for administrators.</p>
      </section>

      <section className="form-section">
        <div className="section-heading">
          <span>03</span>
          <div><h2>Team-Specific Learnings &amp; Corrective Actions</h2><p>All five teams require learnings and corrective actions; enter NA when not applicable.</p></div>
        </div>
        <div className="team-actions">
          {form.teamActions.map((action, index) => (
            <TeamActionForm key={action.teamName} action={action} index={index} onChange={changeTeamAction}
              errors={errors.teamActions?.[index]} />
          ))}
        </div>
      </section>

      <div className="form-actions">
        <button type="button" className="button button-ghost" onClick={cancel}><X size={17} /> Cancel</button>
        <button type="button" className="button button-secondary" onClick={reset}><RotateCcw size={17} /> Reset Form</button>
        <button type="submit" className="button button-primary" disabled={submitting}>
          {submitting ? <span className="button-spinner" /> : <Save size={17} />}
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>

      {otherDialogOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="other-category-title">
            <div className="modal-heading">
              <div><p className="eyebrow">Root Cause Analysis</p><h2 id="other-category-title">Other category details</h2></div>
              <button type="button" className="icon-button" aria-label="Close category details"
                onClick={() => setOtherDialogOpen(false)}><X size={19} /></button>
            </div>
            <div>
              <label className="field" htmlFor="rootCauseOtherDetail">
                <span>Describe the category <b aria-hidden="true">*</b></span>
                <textarea id="rootCauseOtherDetail" rows="5" autoFocus value={otherDetail}
                  aria-invalid={Boolean(otherDetailError)} onChange={(event) => setOtherDetail(event.target.value)} />
                {otherDetailError && <small className="field-error">{otherDetailError}</small>}
              </label>
              <div className="modal-actions">
                <button type="button" className="button button-ghost" onClick={() => setOtherDialogOpen(false)}>Cancel</button>
                <button type="button" className="button button-primary" onClick={saveOtherDetail}>Submit Details</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </form>
  )
}
