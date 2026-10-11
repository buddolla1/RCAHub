import { ArrowLeft, CalendarDays, Edit3 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import Notification from '../components/Notification'
import { fetchRca } from '../services/rcaApi'
import { TEAM_LABELS } from '../utils/rcaFormData'

const dateTime = (value) => value
  ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : '—'
const dateOnly = (value) => value
  ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
  : '—'

function Detail({ label, value, wide = false }) {
  return <div className={`detail-item ${wide ? 'detail-wide' : ''}`}><dt>{label}</dt><dd>{value || '—'}</dd></div>
}

function DetailSection({ number, title, children }) {
  return (
    <section className="detail-section">
      <div className="section-heading"><span>{number}</span><div><h2>{title}</h2></div></div>
      <dl className="details-grid">{children}</dl>
    </section>
  )
}

export default function ViewRca() {
  const { id } = useParams()
  const location = useLocation()
  const [rca, setRca] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(location.state?.notice || '')

  useEffect(() => {
    fetchRca(id)
      .then(setRca)
      .catch((apiError) => setError(apiError.message))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="page-container detail-page">
      <div className="page-header page-header-actions">
        <div><p className="eyebrow">RCA Record</p><h1>{rca?.incidentNumber || 'RCA Details'}</h1><p>{rca?.issueDescription}</p></div>
        <div className="header-buttons">
          <Link className="button button-ghost" to="/rcas"><ArrowLeft size={17} /> All RCAs</Link>
          {rca && <Link className="button button-primary" to={`/rcas/${id}/edit`}><Edit3 size={17} /> Edit RCA</Link>}
        </div>
      </div>
      <Notification message={notice} onClose={() => setNotice('')} />
      <Notification type="error" message={error} onClose={() => setError('')} />
      {loading && <LoadingState label="Loading RCA details" />}
      {rca && (
        <>
          <div className="record-strip">
            <span className={`status status-${rca.rcaStatus.toLowerCase().replaceAll(' ', '-')}`}>{rca.rcaStatus}</span>
            <span><CalendarDays size={16} /> {rca.monthYear || 'Reporting period not set'}</span>
            <span>Priority {rca.priority || '—'}</span>
            <span>Updated {dateTime(rca.updatedAt)}</span>
          </div>
          <DetailSection number="01" title="Incident Details">
            <Detail label="S. No." value={rca.serialNumber} />
            <Detail label="Incident Number" value={rca.incidentNumber} />
            <Detail label="Change Ticket" value={rca.changeTicket} />
            <Detail label="Priority" value={rca.priority} />
            <Detail label="Tower" value={rca.tower} />
            <Detail label="Application" value={rca.application} />
            <Detail label="Program Manager" value={rca.programManager} />
            <Detail label="ART Team" value={rca.artTeamName} />
            <Detail label="Issue Description" value={rca.issueDescription} wide />
          </DetailSection>
          <DetailSection number="02" title="Release and Impact">
            <Detail label="Release Date and Time" value={dateTime(rca.releaseDatetime)} />
            <Detail label="Rollback Status" value={rca.rollbackStatus} />
            <Detail label="Incident Start" value={dateTime(rca.incidentStartTime)} />
            <Detail label="Incident End" value={dateTime(rca.incidentEndTime)} />
            <Detail label="Impacted System" value={rca.impactedSystem} wide />
            <Detail label="Customer / Business Impact" value={rca.businessImpact} wide />
          </DetailSection>
          <DetailSection number="03" title="Root Cause Analysis">
            <Detail label="RCA Type" value={rca.rcaType} />
            <Detail label="Detection Point" value={rca.detectionPoint} />
            <Detail label="Root Cause" value={rca.rootCause} wide />
            <Detail label="Remedy Used" value={rca.remedyUsed} wide />
            <Detail label="Preventive Actions & Next Steps" value={rca.preventiveActions} wide />
          </DetailSection>
          <section className="detail-section">
            <div className="section-heading"><span>04</span><div><h2>Team Learnings and Corrective Actions</h2></div></div>
            <div className="team-detail-list">
              {rca.teamActions.map((action) => (
                <article className="team-detail" key={action.teamName}>
                  <h3>{TEAM_LABELS[action.teamName] || action.teamName}</h3>
                  <dl className="details-grid">
                    <Detail label="Learnings" value={action.learnings} wide />
                    <Detail label="Corrective Actions" value={action.correctiveActions} wide />
                    <Detail label="Target Completion Date" value={dateOnly(action.targetCompletionDate)} />
                  </dl>
                </article>
              ))}
              {rca.teamActions.length === 0 && <div className="empty-state">No team actions have been recorded.</div>}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
