import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck2, CalendarRange, DoorOpen } from 'lucide-react'

import Header from './components/Header.jsx'
import StatCard from './components/StatCard.jsx'
import BookingList from './components/BookingList.jsx'
import BookingForm from './components/BookingForm.jsx'
import Toast from './components/Toast.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'

import { loadBookings, saveBookings } from './utils/storage.js'
import {
  toDateString,
  formatTodayLong,
  sortBookings,
  filterBookings,
  computeStats,
  getAvailability,
  createBooking,
} from './utils/bookingUtils.js'


export default function App() {
  // 1. The bookings list. useState is initialised lazily from localStorage so we
  //    only read storage once, on the very first render.
  const [bookings, setBookings] = useState(() => loadBookings())

  // UI-only state (nothing here is persisted).
  const [isFormOpen, setIsFormOpen] = useState(false) // booking modal open?
  const [filter, setFilter] = useState('all') // schedule filter tab
  const [toast, setToast] = useState(null) // current toast {message,type,key}
  const [pendingCancel, setPendingCancel] = useState(null) // booking awaiting confirmation

  // Today's date string and a nice header label.
  const todayString = toDateString(new Date())
  const todayLabel = formatTodayLong(new Date())

  // 2. Persist to localStorage whenever the bookings change. Because this runs
  //    after render, the saved data always matches what the user sees.
  useEffect(() => {
    saveBookings(bookings)
  }, [bookings])

  // 3. Derive everything else from `bookings` (never stored separately).
  //    useMemo avoids recomputing on unrelated re-renders (e.g. opening a modal).
  const stats = useMemo(() => computeStats(bookings, todayString), [bookings, todayString])
  const availability = useMemo(() => getAvailability(bookings), [bookings])
  const visibleBookings = useMemo(
    () => filterBookings(sortBookings(bookings), filter, todayString),
    [bookings, filter, todayString],
  )

  /** Show a transient toast message. */
  function showToast(message, type = 'success') {
    setToast({ message, type, key: Date.now() })
  }

  /** Create a booking from validated form values and update state immutably. */
  function handleCreate(values) {
    const newBooking = createBooking(values)
    // Immutable update: spread the previous array into a brand-new one.
    setBookings((prev) => [...prev, newBooking])
    setIsFormOpen(false)
    showToast(`“${newBooking.title}” booked successfully.`)
  }

  /** Open the confirmation dialog for a specific booking. */
  function requestCancel(booking) {
    setPendingCancel(booking)
  }

  /** Actually remove the pending booking, freeing its time slot. */
  function confirmCancel() {
    if (!pendingCancel) return // guard against a missing/invalid selection
    setBookings((prev) => prev.filter((b) => b.id !== pendingCancel.id))
    setPendingCancel(null)
    showToast(`“${pendingCancel.title}” was cancelled. The slot is free again.`)
  }

  return (
    <div className="app">
      <div className="container">
        <Header onNewBooking={() => setIsFormOpen(true)} todayLabel={todayLabel} />

        {/* Dashboard statistics — all values derived from real booking data. */}
        <section className="stats" aria-label="Dashboard statistics">
          <StatCard
            icon={CalendarCheck2}
            label="Today's meetings"
            value={stats.todayCount}
            description={stats.todayCount === 1 ? '1 on today' : `${stats.todayCount} on today`}
            tone="indigo"
          />
          <StatCard
            icon={CalendarRange}
            label="Upcoming meetings"
            value={stats.upcomingCount}
            description="Scheduled after today"
            tone="green"
          />
          <StatCard
            icon={DoorOpen}
            label="Room availability"
            value={availability.status}
            description={availability.detail}
            tone={availability.tone === 'busy' ? 'amber' : 'green'}
          />
        </section>

        <BookingList
          bookings={visibleBookings}
          filter={filter}
          onFilterChange={setFilter}
          totalCount={stats.total}
          todayString={todayString}
          onCancel={requestCancel}
        />
      </div>

      {/* Booking modal */}
      {isFormOpen ? (
        <BookingForm
          existingBookings={bookings}
          todayString={todayString}
          onSubmit={handleCreate}
          onClose={() => setIsFormOpen(false)}
        />
      ) : null}

      {/* Cancellation confirmation */}
      <ConfirmDialog
        open={Boolean(pendingCancel)}
        title="Cancel this booking?"
        message={
          pendingCancel
            ? `“${pendingCancel.title}” on ${pendingCancel.date} (${pendingCancel.startTime}–${pendingCancel.endTime}) will be removed and the slot freed.`
            : ''
        }
        confirmLabel="Yes, cancel booking"
        onConfirm={confirmCancel}
        onCancel={() => setPendingCancel(null)}
      />

      {/* Toast notifications */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
