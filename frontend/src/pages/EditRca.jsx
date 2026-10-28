import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import Notification from '../components/Notification'
import RcaForm from '../components/RcaForm'
import { fetchRca, updateRca } from '../services/rcaApi'
import { fromApiRca } from '../utils/rcaFormData'

export default function EditRca() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initialData, setInitialData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    fetchRca(id)
      .then((rca) => setInitialData(fromApiRca(rca)))
      .catch((apiError) => setError(apiError.message))
      .finally(() => setLoading(false))
  }, [id])

  const save = async (payload) => {
    setSubmitting(true)
    setError('')
    setFieldErrors({})
    try {
      const updated = await updateRca(id, payload)
      const identifier = updated.incidentNumber || `${updated.rcaCategory || 'record'} #${updated.id}`
      navigate(`/rcas/${id}`, { state: { notice: `RCA ${identifier} was updated.` } })
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
        <div><p className="eyebrow">RCA Management</p><h1>Edit RCA</h1></div>
        <p>Update analysis and follow-up while preserving the incident record.</p>
      </div>
      <Notification type="error" message={error} onClose={() => setError('')} />
      {loading && <LoadingState label="Loading RCA" />}
      {!loading && initialData && (
        <RcaForm initialData={initialData} onSubmit={save} submitLabel="Update RCA"
          submitting={submitting} apiFieldErrors={fieldErrors} />
      )}
    </div>
  )
}
