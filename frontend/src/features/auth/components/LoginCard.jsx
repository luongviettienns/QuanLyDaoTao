import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHomePathByRole } from '../../../constants/roles'
import { useAuth } from '../hooks/useAuth'
import IconInput from './IconInput'
import './LoginCard.css'

const MAIL_ICON = 'M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 2v.5L12 13l8-4.5V8H4Z'
const LOCK_ICON = 'M12 2a5 5 0 0 0-5 5v3H5v12h14V10h-2V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Zm3 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z'

function LoginCard() {
  const { login, isBootstrapping } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const normalizedIdentifier = identifier.trim()

    if (!normalizedIdentifier || !password) {
      setError('Vui lòng nhập đầy đủ tài khoản và mật khẩu.')
      return
    }

    setIsSubmitting(true)

    const result = await login({
      identifier: normalizedIdentifier,
      password,
      rememberMe,
    })

    setIsSubmitting(false)

    if (!result.ok) {
      if (result.status === 401) {
        setError('Thông tin đăng nhập không chính xác.')
        return
      }

      if (result.status === 422) {
        setError('Dữ liệu đăng nhập chưa hợp lệ.')
        return
      }

      setError('Đăng nhập thất bại. Vui lòng thử lại.')
      return
    }

    const role = result.data?.data?.user?.role
    navigate(getHomePathByRole(role), { replace: true })
  }

  const isDisabled = isSubmitting || isBootstrapping

  return (
    <section className="login-card" aria-label="Đăng nhập">
      <p className="card-subtitle">Đăng nhập</p>
      <h2>Chào mừng quay lại</h2>

      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="account">Email hoặc mã người dùng</label>
        <IconInput
          id="account"
          name="identifier"
          type="text"
          placeholder="vd: gv.nguyenvana@truong.edu.vn"
          iconPath={MAIL_ICON}
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          autoComplete="username"
          disabled={isDisabled}
        />

        <label htmlFor="password">Mật khẩu</label>
        <IconInput
          id="password"
          name="password"
          type="password"
          placeholder="Nhập mật khẩu"
          iconPath={LOCK_ICON}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          disabled={isDisabled}
        />

        <div className="form-row">
          <label className="remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              disabled={isDisabled}
            />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <a href="#">Quên mật khẩu?</a>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" disabled={isDisabled}>
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập hệ thống'}
        </button>
      </form>
    </section>
  )
}

export default LoginCard
