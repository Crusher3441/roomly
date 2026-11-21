import { Trash } from 'lucide-react'
import { formatDate, formatTime, getDurationMinutes, formatDuration } from '../utils/bookingUtils.js'

export default function BookingCard({ booking, isToday, onCancel }) {
  const minutes = getDurationMinutes(booking.startTime, booking.endTime)

  return (
    <li className="booking-card">
      <div className="booking-card__time">
        <span className="booking-card__start">{formatTime(booking.startTime)}</span>
        <span className="booking-card__end">{formatTime(booking.endTime)}</span>
      </div>

      <div className="booking-card__body">
        <div className="booking-card__title-row">
          <h3 className="booking-card__title">{booking.title}</h3>
          {isToday ? <span className="badge badge--today">Today</span> : null}
        </div>
        <p className="booking-card__date">{formatDate(booking.date)}</p>
        <span className="booking-card__duration">{formatDuration(minutes)}</span>
      </div>

      <button
        type="button"
        className="btn btn--ghost btn--danger"
        onClick={() => onCancel(booking)}
        aria-label={`Cancel booking: ${booking.title}`}
      >
        <Trash size={16} aria-hidden="true" />
        Cancel
      </button>
    </li>
  )
}
