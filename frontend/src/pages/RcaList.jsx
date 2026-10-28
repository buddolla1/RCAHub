import { Edit3, Eye, FilePlus2, Search, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DataTable from '../components/DataTable'
import LoadingState from '../components/LoadingState'
import Notification from '../components/Notification'
import { deleteRca, fetchRcas } from '../services/rcaApi'

const initialFilters = { incidentNumber: '', priority: '', application: '', rcaStatus: '', month: '', year: '' }

const formatDate = (value) => value ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value)) : '—'

export default function RcaList() {
  const [filters, setFilters] = useState(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState(initialFilters)
  const [sort, setSort] = useState('createdAt,desc')
  const [page, setPage] = useState(0)
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0, size: 20 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    const [sortBy, sortDirection] = sort.split(',')
    fetchRcas({ ...appliedFilters, page, size: 20, sortBy, sortDirection })
      .then(setData)
      .catch((apiError) => setError(apiError.message))
      .finally(() => setLoading(false))
  }, [appliedFilters, page, sort])

  useEffect(load, [load])

  const applyFilters = (event) => {
    event.preventDefault()
    setPage(0)
    setAppliedFilters(filters)
  }

  const remove = async (rca) => {
    const identifier = rca.incidentNumber || `${rca.rcaCategory || 'RCA'} #${rca.id}`
    if (!window.confirm(`Delete RCA ${identifier}? This action cannot be undone.`)) return
    try {
      await deleteRca(rca.id)
      setNotice(`RCA ${identifier} was deleted.`)
      load()
    } catch (apiError) {
      setError(apiError.message)
    }
  }

  const columns = [
    { key: 'incidentNumber', label: 'RCA Reference', render: (row) => <Link className="table-link" to={`/rcas/${row.id}`}>{row.incidentNumber || `${row.rcaCategory || 'RCA'} #${row.id}`}</Link> },
    { key: 'priority', label: 'Priority', render: (row) => row.priority ? <span className={`priority priority-${row.priority.toLowerCase()}`}>{row.priority}</span> : '—' },
    { key: 'application', label: 'Application', render: (row) => row.application || '—' },
    { key: 'artTeamName', label: 'ART Team', render: (row) => row.artTeamName || '—' },
    { key: 'releaseDatetime', label: 'Release Date', render: (row) => formatDate(row.releaseDatetime) },
    { key: 'rollbackStatus', label: 'Rollback Status', render: (row) => row.rollbackStatus || '—' },
    { key: 'rcaStatus', label: 'RCA Status', render: (row) => <span className={`status status-${row.rcaStatus.toLowerCase().replaceAll(' ', '-')}`}>{row.rcaStatus}</span> },
    { key: 'createdAt', label: 'Created Date', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="table-actions">
        <Link className="icon-button" to={`/rcas/${row.id}`} aria-label={`View ${row.incidentNumber}`} title="View"><Eye size={17} /></Link>
        <Link className="icon-button" to={`/rcas/${row.id}/edit`} aria-label={`Edit ${row.incidentNumber}`} title="Edit"><Edit3 size={17} /></Link>
        <button className="icon-button danger-button" onClick={() => remove(row)} aria-label={`Delete ${row.incidentNumber}`} title="Delete"><Trash2 size={17} /></button>
      </div>
    ) },
  ]

  return (
    <div className="page-container">
      <div className="page-header page-header-actions">
        <div><p className="eyebrow">RCA Management</p><h1>RCA Incidents</h1><p>{data.totalElements} records across production operations.</p></div>
        <Link className="button button-primary" to="/rcas/new"><FilePlus2 size={17} /> Create RCA</Link>
      </div>
      <Notification message={notice} onClose={() => setNotice('')} />
      <Notification type="error" message={error} onClose={() => setError('')} />

      <form className="filter-bar" onSubmit={applyFilters}>
        <label className="search-field">
          <Search size={18} />
          <input aria-label="Search incident number" placeholder="Search incident number"
            value={filters.incidentNumber}
            onChange={(event) => setFilters({ ...filters, incidentNumber: event.target.value })} />
        </label>
        <select aria-label="Filter priority" value={filters.priority}
          onChange={(event) => setFilters({ ...filters, priority: event.target.value })}>
          <option value="">All priorities</option>{['P1', 'P2', 'P3', 'P4'].map((value) => <option key={value}>{value}</option>)}
        </select>
        <input aria-label="Filter application" placeholder="Application" value={filters.application}
          onChange={(event) => setFilters({ ...filters, application: event.target.value })} />
        <select aria-label="Filter RCA status" value={filters.rcaStatus}
          onChange={(event) => setFilters({ ...filters, rcaStatus: event.target.value })}>
          <option value="">All statuses</option>{['Open', 'In Progress', 'Pending Review', 'Request Closure', 'Closed'].map((value) => <option key={value}>{value}</option>)}
        </select>
        <select aria-label="Sort RCAs" value={sort} onChange={(event) => { setSort(event.target.value); setPage(0) }}>
          <option value="createdAt,desc">Newest created</option>
          <option value="createdAt,asc">Oldest created</option>
          <option value="incidentNumber,asc">Incident number</option>
          <option value="priority,asc">Priority</option>
          <option value="rcaStatus,asc">RCA status</option>
        </select>
        <button className="button button-secondary" type="submit">Apply</button>
        <button className="button button-ghost" type="button" onClick={() => {
          setFilters(initialFilters); setAppliedFilters(initialFilters); setPage(0)
        }}>Clear</button>
      </form>

      {loading ? <LoadingState label="Loading RCA incidents" /> : (
        <>
          <DataTable columns={columns} rows={data.content} rowKey={(row) => row.id}
            emptyMessage="No RCAs match the current filters." />
          <div className="pagination">
            <span>Page {data.totalPages === 0 ? 0 : page + 1} of {data.totalPages}</span>
            <div>
              <button className="button button-secondary" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Previous</button>
              <button className="button button-secondary" disabled={page + 1 >= data.totalPages} onClick={() => setPage((current) => current + 1)}>Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
