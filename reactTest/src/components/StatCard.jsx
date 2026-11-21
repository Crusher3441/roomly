
export default function StatCard({ icon: Icon, label, value, description, tone = 'indigo' }) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__icon" aria-hidden="true">
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <div className="stat-card__content">
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {description ? <p className="stat-card__desc">{description}</p> : null}
      </div>
    </article>
  )
}
