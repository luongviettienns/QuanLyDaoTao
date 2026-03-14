import { useEffect, useMemo, useState } from 'react'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import DashboardStats from '../components/dashboard/DashboardStats'
import DashboardTaskList from '../components/dashboard/DashboardTaskList'
import { ROLE_CONFIG } from '../components/dashboard/dashboardConfig.jsx'
import AppHeader from '../components/shared/AppHeader'
import './RoleHomePage.css'

const MOBILE_BREAKPOINT = 760

function getIsMobileViewport() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
}

function RoleHomePage({ role = 'student', title, summary }) {
  const config = useMemo(() => ROLE_CONFIG[role] || ROLE_CONFIG.student, [role])
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(getIsMobileViewport)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [activeMenuKey, setActiveMenuKey] = useState(() => config.menu[0]?.key ?? '')
  const resolvedActiveMenuKey = config.menu.some((item) => item.key === activeMenuKey)
    ? activeMenuKey
    : config.menu[0]?.key ?? ''
  const isSidebarCollapsed = isMobileViewport ? !isMobileSidebarOpen : isDesktopSidebarCollapsed

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)

    function syncViewportState(event) {
      setIsMobileViewport(event.matches)

      if (event.matches) {
        setIsMobileSidebarOpen(false)
      }
    }

    syncViewportState(mediaQuery)
    mediaQuery.addEventListener('change', syncViewportState)

    return () => {
      mediaQuery.removeEventListener('change', syncViewportState)
    }
  }, [])

  function handleSidebarToggle() {
    if (isMobileViewport) {
      setIsMobileSidebarOpen((current) => !current)
      return
    }

    setIsDesktopSidebarCollapsed((current) => !current)
  }

  function handleMenuSelect(menuKey) {
    setActiveMenuKey(menuKey)

    if (isMobileViewport) {
      setIsMobileSidebarOpen(false)
    }
  }

  return (
    <main className="role-home-page" aria-label={title}>
      <div
        className={`dashboard-shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${
          isMobileViewport ? 'is-mobile-shell' : ''
        }`}
      >
        <DashboardSidebar
          isCollapsed={isSidebarCollapsed}
          isMobile={isMobileViewport}
          onToggle={handleSidebarToggle}
          menu={config.menu}
          activeMenuKey={resolvedActiveMenuKey}
          onMenuSelect={handleMenuSelect}
          roleLabel={config.label}
          accent={config.accent}
          spotlight={config.spotlight}
        />

        <section className="dashboard-main">
          <AppHeader title={title} subtitle={config.accent} />

          <section className="dashboard-summary dashboard-surface dashboard-card" aria-label="Tổng quan vai trò">
            <p className="dashboard-eyebrow">Tổng quan</p>
            <h2 className="dashboard-summary-title">{config.summaryTitle}</h2>
            <p className="dashboard-summary-text">{summary}</p>
          </section>

          <DashboardStats stats={config.stats} />
          <DashboardTaskList tasks={config.tasks} title={config.taskTitle} eyebrow={config.taskEyebrow} />
        </section>
      </div>
    </main>
  )
}

export default RoleHomePage
