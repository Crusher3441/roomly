import { CalendarCheck, Building, CalendarDays, Plus } from 'lucide-react'


export default function Header({ onNewBooking, todayLabel }) {
  return (
    <header className="header">
      <div className="header__brand">
        <div className="logo" aria-hidden="true">
          <CalendarCheck size={22} strokeWidth={2.2} />
        </div>
        <div className="header__titles">
          <h1 className="header__title">Roomly</h1>
          <p className="header__subtitle">Meeting Room Scheduler</p>
        </div>
      </div>

      <div className="header__right">
        <div className="header__meta">
          <span className="header__room">
            <Building size={15} aria-hidden="true" />
            Aurora Conference Room
          </span>
          <span className="header__date">
            <CalendarDays size={15} aria-hidden="true" />
            {todayLabel}
          </span>
        </div>
        <button type="button" className="btn btn--primary" onClick={onNewBooking}>
          <Plus size={18} aria-hidden="true" />
          New Booking
        </button>
      </div>
    </header>
  )
}
