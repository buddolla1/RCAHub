import { AlertCircle, CheckCircle2, FileText, RotateCcw, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import LoadingState from '../components/LoadingState'
import Notification from '../components/Notification'
import { fetchDashboardSummary } from '../services/rcaApi'

const chartColors = ['#2563eb', '#0f766e', '#d97706', '#be123c', '#6d28d9', '#4d7c0f']

function SummaryCard({ label, value, note, icon: Icon, tone }) {
  return (
    <article className={`summary-card summary-${tone}`}>
      <div className="summary-card-top"><span>{label}</span><Icon size={20} /></div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  )
}

function ChartPanel({ title, subtitle, children, empty }) {
  return (
    <section className="chart-panel">
      <div className="chart-heading"><h2>{title}</h2><p>{subtitle}</p></div>
      {empty ? <div className="chart-empty">No data available</div> : <div className="chart-area">{children}</div>}
    </section>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardSummary()
      .then(setSummary)
      .catch((apiError) => setError(apiError.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-container"><LoadingState label="Loading dashboard" /></div>

  return (
    <div className="page-container">
      <div className="page-header">
        <div><p className="eyebrow">Operational Overview</p><h1>RCA Dashboard</h1></div>
        <p>Incident health, release outcomes, and remediation progress.</p>
      </div>
      <Notification type="error" message={error} onClose={() => setError('')} />
      {summary && (
        <>
          <div className="summary-grid">
            <SummaryCard label="Total RCAs" value={summary.totalRcas} note="All recorded incidents" icon={FileText} tone="blue" />
            <SummaryCard label="Completed Rollbacks" value={summary.completedRollbacks} note="Rollback status: Completed" icon={RotateCcw} tone="amber" />
            <SummaryCard label="Open RCAs" value={summary.openRcas} note="Awaiting active analysis" icon={AlertCircle} tone="red" />
            <SummaryCard label="In Progress" value={summary.inProgressRcas} note="Analysis underway" icon={Timer} tone="teal" />
            <SummaryCard label="Completed RCAs" value={summary.completedRcas} note="Analysis closed" icon={CheckCircle2} tone="green" />
          </div>

          <div className="charts-grid">
            <ChartPanel title="RCA Count by Priority" subtitle="Incident volume by assigned priority" empty={!summary.byPriority.length}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.byPriority} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d9e2ec" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f0f4f8' }} />
                  <Bar dataKey="count" name="RCAs" fill="#2563eb" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="RCA Count by Month" subtitle="Incident reporting trend" empty={!summary.byMonth.length}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.byMonth} margin={{ top: 8, right: 18, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d9e2ec" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" name="RCAs" stroke="#0f766e" strokeWidth={3}
                    dot={{ r: 4, fill: '#0f766e' }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="RCA Count by Application" subtitle="Top affected applications" empty={!summary.byApplication.length}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.byApplication} layout="vertical" margin={{ top: 8, right: 18, left: 18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#d9e2ec" />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="label" width={90} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f0f4f8' }} />
                  <Bar dataKey="count" name="RCAs" fill="#d97706" radius={[0, 3, 3, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="Rollback Status Distribution" subtitle="Release rollback outcomes" empty={!summary.byRollbackStatus.length}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={summary.byRollbackStatus} dataKey="count" nameKey="label" innerRadius={54}
                    outerRadius={82} paddingAngle={2} isAnimationActive={false}>
                    {summary.byRollbackStatus.map((entry, index) => <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={34} />
                </PieChart>
              </ResponsiveContainer>
            </ChartPanel>
          </div>
        </>
      )}
    </div>
  )
}
