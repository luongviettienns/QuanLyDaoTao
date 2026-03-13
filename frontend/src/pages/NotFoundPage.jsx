import { Link } from 'react-router-dom'
import './StatusPage.css'

function NotFoundPage() {
  return (
    <main className="status-page" aria-label="Không tìm thấy trang">
      <section className="status-card">
        <p className="status-code">404</p>
        <h1>Trang không tồn tại</h1>
        <p>Đường dẫn bạn truy cập không hợp lệ hoặc đã bị thay đổi.</p>
        <Link to="/login" className="status-link">
          Quay về trang đăng nhập
        </Link>
      </section>
    </main>
  )
}

export default NotFoundPage
