import './DashboardTaskList.css'

function DashboardTaskList({ tasks, title, eyebrow }) {
  return (
    <article className="dashboard-surface dashboard-card dashboard-timeline-card">
      <div className="dashboard-section-head compact">
        <div>
          <p className="dashboard-eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
        </div>
      </div>

      <div className="task-list">
        {tasks.map((item, index) => (
          <article key={`${item.title}-${index}`} className={`task-item ${index === 0 ? 'featured' : ''}`}>
            <span className="task-order">{String(index + 1).padStart(2, '0')}</span>

            <div className="task-body">
              <div className="task-heading">
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </div>

              <div className="task-meta">
                <div className="task-chip">
                  <span>Hạn xử lý</span>
                  <strong>{item.due}</strong>
                </div>
                <div className="task-chip">
                  <span>Phạm vi</span>
                  <strong>{item.scope}</strong>
                </div>
                <div className="task-chip">
                  <span>Liên quan</span>
                  <strong>{item.count}</strong>
                </div>
              </div>

              {item.actionLabel ? <span className="task-action">{item.actionLabel}</span> : null}
            </div>

            <div className="task-aside">
              <span className={`task-badge ${item.priorityTone || 'neutral'}`}>Ưu tiên {item.priority}</span>
              <span className={`task-badge ${item.statusTone || 'neutral'}`}>{item.status}</span>
            </div>
          </article>
        ))}
      </div>
    </article>
  )
}

export default DashboardTaskList
