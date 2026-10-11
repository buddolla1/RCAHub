import { AlertCircle, CheckCircle2, X } from 'lucide-react'

export default function Notification({ type = 'success', message, onClose }) {
  if (!message) return null
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle

  return (
    <div className={`notification notification-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon size={19} />
      <span>{message}</span>
      {onClose && (
        <button className="icon-button" onClick={onClose} aria-label="Dismiss notification">
          <X size={17} />
        </button>
      )}
    </div>
  )
}
