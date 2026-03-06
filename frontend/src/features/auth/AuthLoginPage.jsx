import './AuthLoginPage.css'
import BrandPanel from './components/BrandPanel'
import LoginCard from './components/LoginCard'

function AuthLoginPage() {
  return (
    <main className="login-page">
      <BrandPanel />
      <LoginCard />
    </main>
  )
}

export default AuthLoginPage
