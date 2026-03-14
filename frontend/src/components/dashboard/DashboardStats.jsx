import './DashboardStats.css'

function DashboardStats({ stats }) {
  return (
    <section className="dashboard-stats" aria-label="Thông tin hành động theo vai trò">
      {stats.map((item) => (
        <article key={item.label} className={`dashboard-surface dashboard-card stat-card stat-card-${item.tone}`}>
          <p className="stat-label">{item.label}</p>
          <strong>{item.value}</strong>
          <p className="stat-description">{item.delta}</p>
          <span className={`stat-tone ${item.tone}`}>{item.tone === 'good' ? 'Đang theo dõi' : item.tone === 'warn' ? 'Cần ưu tiên' : 'Cần kiểm tra'}</span>
        </article>
      ))}
    </section>
  )
}

export default DashboardStats
