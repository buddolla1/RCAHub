import { Menu } from 'lucide-react'

export default function Header({ onMenu }) {
  return (
    <header className="app-header">
      <button className="icon-button mobile-menu" onClick={onMenu} aria-label="Open navigation">
        <Menu size={21} />
      </button>
      <div className="brand-mark" aria-hidden="true">R</div>
      <div className="brand-copy">
        <strong>RCAHub</strong>
        <span>Root Cause Analysis Hub</span>
      </div>
      <div className="environment-label">Operations</div>
    </header>
  )
}
