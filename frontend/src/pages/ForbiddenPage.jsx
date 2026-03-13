import { Link } from 'react-router-dom'
import './StatusPage.css'

function ForbiddenPage() {
  return (
    <main className="status-page" aria-label="Truy cập bị từ chối">
      <section className="status-card">
        <p className="status-code">403</p>
        <h1>Bạn không có quyền truy cập</h1>
        <p>Vui lòng đăng nhập bằng tài khoản có quyền phù hợp để tiếp tục.</p>
        <Link to="/login" className="status-link">
          Quay về trang đăng nhập
        </Link>
      </section>
    </main>
  )
}

export default ForbiddenPage
