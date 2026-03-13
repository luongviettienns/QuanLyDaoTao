import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import './AppHeader.css'

function AppHeader({ title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="app-header">
      <div>
        <p className="app-header-eyebrow">Cổng quản lý đào tạo</p>
        <h1>{title}</h1>
      </div>

      <div className="app-header-actions">
        <p className="app-header-user">
          <strong>{user?.name}</strong>
          <span>{user?.role}</span>
        </p>
        <button type="button" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </header>
  )
}

export default AppHeader
