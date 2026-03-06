import './BrandPanel.css'

function BrandPanel() {
  return (
    <section className="brand-panel" aria-label="Giới thiệu hệ thống">
      <p className="eyebrow">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 2 3 6v6c0 6.1 4.1 11.7 9 13 4.9-1.3 9-6.9 9-13V6l-9-4Zm0 3.2 6 2.7V12c0 4.4-2.8 8.7-6 10-3.2-1.3-6-5.6-6-10V7.9l6-2.7Z" />
        </svg>
        <span>Cổng quản lý đào tạo</span>
      </p>

      <h1 className="brand-title">Đăng nhập hệ thống học vụ</h1>
      <p className="brand-desc">Nền tảng quản trị tập trung cho Nhà trường, Giảng viên và Sinh viên.</p>

      <div className="feature-list">
        <article>
          <h2>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-2-5l-4 4-2-2-1.4 1.4 3.4 3.4 6-6A8.9 8.9 0 0 0 12 3Z" />
            </svg>
            <span>Bảo mật và phân quyền rõ ràng</span>
          </h2>
        </article>
        <article>
          <h2>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 5h16v2H4V5Zm0 6h10v2H4v-2Zm0 6h16v2H4v-2Zm12-6h4v8h-4v-8Z" />
            </svg>
            <span>Dữ liệu học vụ đồng bộ tức thời</span>
          </h2>
        </article>
        <article>
          <h2>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 5a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 10c4.4 0 8 2 8 4.5V22H4v-2.5C4 17 7.6 15 12 15Z" />
            </svg>
            <span>Trải nghiệm thống nhất cho mọi vai trò</span>
          </h2>
        </article>
      </div>
    </section>
  )
}

export default BrandPanel
