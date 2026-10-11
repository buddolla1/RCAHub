import { BarChart3, ChevronRight, FilePlus2, Files, Lightbulb } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/rcas', label: 'All RCAs', icon: Files },
  { to: '/rcas/new', label: 'Create RCA', icon: FilePlus2 },
]

export default function Sidebar({ open, onNavigate }) {
  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <nav aria-label="Primary navigation">
        <p className="nav-label">Overview</p>
        <NavLink to="/dashboard" onClick={onNavigate}>
          <BarChart3 size={18} />
          <span>Dashboard</span>
          <ChevronRight className="nav-chevron" size={16} />
        </NavLink>

        <p className="nav-label nav-group-label">RCA Management</p>
        {navItems.slice(1).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/rcas'} onClick={onNavigate}>
            <Icon size={18} />
            <span>{label}</span>
            <ChevronRight className="nav-chevron" size={16} />
          </NavLink>
        ))}

        <p className="nav-label nav-group-label">Coming Later</p>
        <div className="disabled-nav" aria-disabled="true">
          <Lightbulb size={18} />
          <span>Reports</span>
        </div>
      </nav>
    </aside>
  )
}
