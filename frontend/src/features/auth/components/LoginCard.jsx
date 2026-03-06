import IconInput from './IconInput'
import './LoginCard.css'

const MAIL_ICON = 'M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 2v.5L12 13l8-4.5V8H4Z'
const LOCK_ICON = 'M12 2a5 5 0 0 0-5 5v3H5v12h14V10h-2V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Zm3 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z'

function LoginCard() {
  return (
    <section className="login-card" aria-label="Đăng nhập">
      <p className="card-subtitle">Đăng nhập</p>
      <h2>Chào mừng quay lại</h2>

      <form className="login-form" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="account">Email hoặc mã người dùng</label>
        <IconInput
          id="account"
          type="text"
          placeholder="vd: gv.nguyenvana@truong.edu.vn"
          iconPath={MAIL_ICON}
        />

        <label htmlFor="password">Mật khẩu</label>
        <IconInput id="password" type="password" placeholder="Nhập mật khẩu" iconPath={LOCK_ICON} />

        <div className="form-row">
          <label className="remember">
            <input type="checkbox" />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <a href="#">Quên mật khẩu?</a>
        </div>

        <button type="submit">Đăng nhập hệ thống</button>
      </form>
    </section>
  )
}

export default LoginCard
