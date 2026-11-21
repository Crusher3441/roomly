import { CalendarX2 } from 'lucide-react'
import BookingCard from './BookingCard.jsx'

 
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
]

export default function BookingList({
  bookings,
  filter,
  onFilterChange,
  totalCount,
  todayString,
  onCancel,
}) {
  return (
    <section className="schedule" aria-labelledby="schedule-heading">
      <div className="schedule__header">
        <div>
          <h2 id="schedule-heading" className="schedule__title">
            Schedule
          </h2>
          <p className="schedule__count">
            {totalCount} {totalCount === 1 ? 'booking' : 'bookings'} in total
          </p>
        </div>

        {/* Filter tabs. aria-pressed communicates the active choice to AT. */}
        <div className="tabs" role="group" aria-label="Filter bookings">
          {FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`tab ${filter === option.id ? 'tab--active' : ''}`}
              aria-pressed={filter === option.id}
              onClick={() => onFilterChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {bookings.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <ul className="booking-list">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              isToday={booking.date === todayString}
              onCancel={onCancel}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

/**
 * Context-aware empty state so the message matches the active filter.
 */
function EmptyState({ filter }) {
  const messages = {
    all: { title: 'No bookings yet', body: 'Create your first booking to fill the schedule.' },
    today: { title: 'Nothing scheduled today', body: 'The room is free — add a booking for today.' },
    upcoming: { title: 'No upcoming bookings', body: 'Future meetings will appear here.' },
  }
  const { title, body } = messages[filter] || messages.all

  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        <CalendarX2 size={26} />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__body">{body}</p>
    </div>
  )
}
