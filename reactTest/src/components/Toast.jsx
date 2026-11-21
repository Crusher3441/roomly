import { useEffect } from 'react'
import { CircleCheckBig, CircleAlert, X } from 'lucide-react'


export default function Toast({ toast, onDismiss }) {
  // Auto-hide the toast after 3.5s. The timer is cleared on unmount or when the
  // toast changes, so overlapping toasts can't leave dangling timers.
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(onDismiss, 3500)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  if (!toast) return null

  const isSuccess = toast.type === 'success'
  const Icon = isSuccess ? CircleCheckBig : CircleAlert

  return (
    <div
      key={toast.key}
      className={`toast toast--${toast.type}`}
      role="status"
      aria-live="polite"
    >
      <Icon size={18} aria-hidden="true" className="toast__icon" />
      <span className="toast__message">{toast.message}</span>
      <button type="button" className="toast__close" onClick={onDismiss} aria-label="Dismiss notification">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
