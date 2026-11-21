
export function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}


export function toDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}


export function isValidDateString(dateString) {
  if (typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false
  }
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}


export function formatTime(time) {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12 // 0 -> 12 (midnight), 13 -> 1
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
}

export function getDurationMinutes(startTime, endTime) {
  return timeToMinutes(endTime) - timeToMinutes(startTime)
}

export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
  if (hours > 0) return `${hours}h`
  return `${mins}m`
}

export function formatDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** Long-form "today" label used in the header, e.g. "Monday, October 12, 2026". */
export function formatTodayLong(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}


export function doBookingsOverlap(a, b) {
  // Different dates can never conflict — compare dates first and bail out early.
  if (a.date !== b.date) return false

  const aStart = timeToMinutes(a.startTime)
  const aEnd = timeToMinutes(a.endTime)
  const bStart = timeToMinutes(b.startTime)
  const bEnd = timeToMinutes(b.endTime)

  return aStart < bEnd && bStart < aEnd
}


export function findConflict(booking, existingBookings) {
  return existingBookings.find((existing) => doBookingsOverlap(booking, existing)) || null
}


export function isInPast(dateString, startTime, now = new Date()) {
  const start = new Date(`${dateString}T${startTime}`)
  return start.getTime() < now.getTime()
}


export function validateBooking({ title, date, startTime, endTime }, existingBookings) {
  const errors = {}

  // 1. Title is required (after trimming so "   " does not pass).
  if (!title || !title.trim()) {
    errors.title = 'A meeting title is required.'
  }

  // 2. Date must be present and a real calendar date.
  let dateOk = false
  if (!date) {
    errors.date = 'A date is required.'
  } else if (!isValidDateString(date)) {
    errors.date = 'Please choose a valid date.'
  } else {
    dateOk = true
  }

  // 3. Both times must be provided.
  let timesProvided = true
  if (!startTime) {
    errors.startTime = 'A start time is required.'
    timesProvided = false
  }
  if (!endTime) {
    errors.endTime = 'An end time is required.'
    timesProvided = false
  }

  // 4. Start must be STRICTLY before end (equal times are not a valid meeting).
  let orderOk = false
  if (timesProvided) {
    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      errors.endTime = 'End time must be after the start time.'
    } else {
      orderOk = true
    }
  }

  // 5. No bookings in the past (only meaningful once date + order are valid).
  let notPast = true
  if (dateOk && orderOk && isInPast(date, startTime)) {
    errors.date = 'You cannot book a meeting in the past.'
    notPast = false
  }

  // 6. No overlap with an existing booking on the same date.
  if (dateOk && orderOk && notPast) {
    const conflict = findConflict({ date, startTime, endTime }, existingBookings)
    if (conflict) {
      errors.startTime = `Conflicts with “${conflict.title}” (${conflict.startTime}–${conflict.endTime}).`
    }
  }

  return { valid: Object.keys(errors).length === 0, errors }
}


export function createBooking({ title, date, startTime, endTime }) {
  return {
    id: generateId(),
    title: title.trim(), // store the trimmed title
    date,
    startTime,
    endTime,
  }
}


export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}


export function sortBookings(bookings) {
  return [...bookings].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  })
}


export function filterBookings(bookings, filter, todayString) {
  if (filter === 'today') return bookings.filter((b) => b.date === todayString)
  if (filter === 'upcoming') return bookings.filter((b) => b.date > todayString)
  return bookings
}


export function computeStats(bookings, todayString) {
  let todayCount = 0
  let upcomingCount = 0
  for (const booking of bookings) {
    if (booking.date === todayString) todayCount += 1
    else if (booking.date > todayString) upcomingCount += 1
  }
  return { todayCount, upcomingCount, total: bookings.length }
}


export function getAvailability(bookings, now = new Date()) {
  const todayString = toDateString(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const todays = sortBookings(bookings.filter((b) => b.date === todayString))

  // Currently in a meeting?
  const current = todays.find(
    (b) =>
      timeToMinutes(b.startTime) <= nowMinutes &&
      nowMinutes < timeToMinutes(b.endTime),
  )
  if (current) {
    return { tone: 'busy', status: 'In use', detail: `Busy until ${formatTime(current.endTime)}` }
  }

  // Free right now, but another meeting starts later today?
  const next = todays.find((b) => timeToMinutes(b.startTime) > nowMinutes)
  if (next) {
    return { tone: 'free', status: 'Available', detail: `Free until ${formatTime(next.startTime)}` }
  }

  // Nothing left today.
  return { tone: 'free', status: 'Available', detail: 'Free for the rest of today' }
}



