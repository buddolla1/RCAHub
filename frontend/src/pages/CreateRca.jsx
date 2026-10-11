import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Notification from '../components/Notification'
import RcaForm from '../components/RcaForm'
import { createRca } from '../services/rcaApi'
import { emptyRca } from '../utils/rcaFormData'

export default function CreateRca() {
  const navigate = useNavigate()
  const [initialData] = useState(emptyRca)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const save = async (payload) => {
    setSubmitting(true)
    setError('')
    setFieldErrors({})
    try {
      const created = await createRca(payload)
      navigate(`/rcas/${created.id}`, { state: { notice: `RCA ${created.incidentNumber} was created.` } })
      return true
    } catch (apiError) {
      setError(apiError.message)
      setFieldErrors(apiError.fieldErrors || {})
      return false
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-container form-page">
      <div className="page-header">
        <div><p className="eyebrow">RCA Management</p><h1>Create RCA</h1></div>
        <p>Document the incident, analysis, and accountable follow-up.</p>
      </div>
      <Notification type="error" message={error} onClose={() => setError('')} />
      <RcaForm initialData={initialData} onSubmit={save} submitLabel="Save RCA"
        submitting={submitting} apiFieldErrors={fieldErrors} />
    </div>
  )
}
