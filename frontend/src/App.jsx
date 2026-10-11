import { lazy, Suspense, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import LoadingState from './components/LoadingState'
import Sidebar from './components/Sidebar'

const CreateRca = lazy(() => import('./pages/CreateRca'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const EditRca = lazy(() => import('./pages/EditRca'))
const RcaList = lazy(() => import('./pages/RcaList'))
const ViewRca = lazy(() => import('./pages/ViewRca'))

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <Header onMenu={() => setSidebarOpen((open) => !open)} />
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <main className="main-content">
        <Suspense fallback={<LoadingState label="Loading page" />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rcas" element={<RcaList />} />
            <Route path="/rcas/new" element={<CreateRca />} />
            <Route path="/rcas/:id" element={<ViewRca />} />
            <Route path="/rcas/:id/edit" element={<EditRca />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}
