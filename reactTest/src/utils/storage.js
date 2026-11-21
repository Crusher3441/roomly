

// A single, stable key so we know exactly where our data lives in localStorage.
export const STORAGE_KEY = 'roomly.bookings.v1'

export function loadBookings() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return [] // First visit — nothing saved yet.

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return [] // Wrong top-level type — ignore it.

    // Keep only records that actually look like a booking, so one bad entry
    // cannot corrupt the rest of the list.
    return parsed.filter(isBookingShape)
  } catch (error) {
    // Malformed JSON or storage access failure → start clean rather than crash.
    console.warn('[Roomly] Could not load bookings from storage:', error)
    return []
  }
}


export function saveBookings(bookings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
  } catch (error) {
    // e.g. storage full or disabled. We log and continue; the app still works
    // for the current session, it just won't survive a refresh.
    console.warn('[Roomly] Could not save bookings to storage:', error)
  }
}


function isBookingShape(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.date === 'string' &&
    typeof value.startTime === 'string' &&
    typeof value.endTime === 'string'
  )
}
