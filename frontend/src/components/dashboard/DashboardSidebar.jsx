import { ICONS } from './dashboardConfig.jsx'
import './DashboardSidebar.css'

function DashboardSidebar({
  isCollapsed,
  isMobile = false,
  onToggle,
  menu,
  activeMenuKey,
  onMenuSelect,
  roleLabel,
  accent,
  spotlight,
}) {
  const activeMenuItem = menu.find((item) => item.key === activeMenuKey) || menu[0]
  const spotlightIcon = spotlight?.icon || activeMenuItem?.icon || 'chart'
  const toggleLabel = isMobile
    ? isCollapsed
      ? 'Mở menu điều hướng'
      : 'Thu gọn menu điều hướng'
    : isCollapsed
      ? 'Mở sidebar'
      : 'Thu gọn sidebar'

  return (
    <aside
      className={`dashboard-sidebar ${isCollapsed ? 'is-collapsed' : ''} ${isMobile ? 'is-mobile' : ''}`}
      aria-label="Điều hướng chức năng"
    >
      <div className="sidebar-panel dashboard-surface">
        <div className="sidebar-panel-top">
          <div className="sidebar-topbar">
            <button
              type="button"
              className="sidebar-toggle"
              onClick={onToggle}
              aria-label={toggleLabel}
              aria-pressed={isMobile ? undefined : isCollapsed}
              aria-expanded={isMobile ? !isCollapsed : undefined}
              aria-controls={isMobile ? 'dashboard-sidebar-nav-panel' : undefined}
            >
              {ICONS.menu}
            </button>

            <div className="sidebar-brand">
              <span className="sidebar-brand-mark">ED</span>
              <div className="sidebar-brand-copy">
                <p className="sidebar-brand-name">
                  <span className="sidebar-brand-name-full">Edu Portal</span>
                  <span className="sidebar-brand-name-short">EDU</span>
                </p>
                <strong>{roleLabel}</strong>
                <span className="sidebar-brand-accent">{accent}</span>
              </div>
            </div>
          </div>

          {isMobile && activeMenuItem ? (
            <div className="sidebar-mobile-context" aria-live="polite">
              <span className="sidebar-mobile-context-icon">{ICONS[activeMenuItem.icon]}</span>
              <div className="sidebar-mobile-context-copy">
                <p>Đang xem</p>
                <strong>{activeMenuItem.label}</strong>
                <span>{roleLabel}</span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="sidebar-nav-panel" id="dashboard-sidebar-nav-panel">
          <nav className="sidebar-nav">
            {menu.map((item) => {
              const isActive = activeMenuKey === item.key

              return (
                <button
                  key={item.key}
                  type="button"
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  title={item.label}
                  aria-label={item.label}
                  aria-pressed={isActive}
                  onClick={() => onMenuSelect(item.key)}
                >
                  <span className="sidebar-link-icon">{ICONS[item.icon]}</span>
                  <span className="sidebar-link-copy">
                    <span className="sidebar-link-text">{item.label}</span>
                    <span className="sidebar-link-state">{isActive ? 'Đang xem' : 'Mở mục này'}</span>
                  </span>
                </button>
              )
            })}
          </nav>

          <div className="sidebar-spotlight">
            <span className="sidebar-spotlight-icon">{ICONS[spotlightIcon]}</span>
            <div className="sidebar-spotlight-body">
              <p className="sidebar-caption">{spotlight?.eyebrow || 'Điểm nổi bật'}</p>
              <strong>{spotlight?.title || roleLabel}</strong>
              <span>{spotlight?.description || accent}</span>
              {spotlight?.meta ? <small className="sidebar-spotlight-meta">{spotlight.meta}</small> : null}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default DashboardSidebar
