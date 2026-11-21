import { useEffect, useRef, useState } from 'react'
import { CalendarClock, Clock, Type, X } from 'lucide-react'
import { validateBooking } from '../utils/bookingUtils.js'


export default function BookingForm({ existingBookings, todayString, onSubmit, onClose }) {
  // Form field state. The date defaults to today for convenience.
  const [values, setValues] = useState({
    title: '',
    date: todayString,
    startTime: '',
    endTime: '',
  })
  // Field-level error messages, keyed by field name.
  const [errors, setErrors] = useState({})

  const titleRef = useRef(null)
  const cardRef = useRef(null)

  // Focus the first field when the modal opens (good UX + keyboard friendly).
  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  // Close on Escape.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Keep keyboard focus inside the modal while it is open (focus trap).
  useEffect(() => {
    function handleTab(event) {
      if (event.key !== 'Tab' || !cardRef.current) return
      const focusable = cardRef.current.querySelectorAll(
        'button, input, select, textarea, [href]',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [])

  // Update one field and clear its error so the message disappears as the user
  // fixes the problem. Overlap depends on date/start/end, so changing any of
  // those clears the (startTime) conflict message too.
  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      if (field === 'date' || field === 'endTime') delete next.startTime
      return next
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const result = validateBooking(values, existingBookings)
    if (!result.valid) {
      // Show errors but KEEP the values so the user can correct and resubmit.
      setErrors(result.errors)
      return
    }
    // Valid: hand off to the parent, which creates the booking and closes us.
    onSubmit(values)
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-form-title"
        ref={cardRef}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <div className="modal__heading">
            <span className="modal__icon" aria-hidden="true">
              <CalendarClock size={20} />
            </span>
            <div>
              <h2 id="booking-form-title" className="modal__title">
                New booking
              </h2>
              <p className="modal__subtitle">Reserve a slot in the Aurora Conference Room.</p>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close form">
            <X size={18} />
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className={`field ${errors.title ? 'field--error' : ''}`}>
            <label htmlFor="title">
              <Type size={14} aria-hidden="true" /> Meeting title
            </label>
            <input
              id="title"
              ref={titleRef}
              type="text"
              value={values.title}
              placeholder="e.g. Sprint planning"
              onChange={(e) => handleChange('title', e.target.value)}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title ? (
              <p className="field__error" id="title-error">
                {errors.title}
              </p>
            ) : null}
          </div>

          <div className={`field ${errors.date ? 'field--error' : ''}`}>
            <label htmlFor="date">
              <CalendarClock size={14} aria-hidden="true" /> Date
            </label>
            <input
              id="date"
              type="date"
              value={values.date}
              onChange={(e) => handleChange('date', e.target.value)}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? 'date-error' : undefined}
            />
            {errors.date ? (
              <p className="field__error" id="date-error">
                {errors.date}
              </p>
            ) : null}
          </div>

          <div className="form__row">
            <div className={`field ${errors.startTime ? 'field--error' : ''}`}>
              <label htmlFor="startTime">
                <Clock size={14} aria-hidden="true" /> Start time
              </label>
              <input
                id="startTime"
                type="time"
                value={values.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                aria-invalid={Boolean(errors.startTime)}
                aria-describedby={errors.startTime ? 'startTime-error' : undefined}
              />
              {errors.startTime ? (
                <p className="field__error" id="startTime-error">
                  {errors.startTime}
                </p>
              ) : null}
            </div>

            <div className={`field ${errors.endTime ? 'field--error' : ''}`}>
              <label htmlFor="endTime">
                <Clock size={14} aria-hidden="true" /> End time
              </label>
              <input
                id="endTime"
                type="time"
                value={values.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                aria-invalid={Boolean(errors.endTime)}
                aria-describedby={errors.endTime ? 'endTime-error' : undefined}
              />
              {errors.endTime ? (
                <p className="field__error" id="endTime-error">
                  {errors.endTime}
                </p>
              ) : null}
            </div>
          </div>

          <div className="form__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Create booking
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

