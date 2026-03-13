import AppHeader from '../components/shared/AppHeader'
import './RoleHomePage.css'

function RoleHomePage({ title, summary }) {
  return (
    <main className="role-home-page" aria-label={title}>
      <div className="role-home-shell">
        <AppHeader title={title} />

        <section className="role-home-card">
          <p className="role-home-eyebrow">Tổng quan</p>
          <h2>{title}</h2>
          <p>{summary}</p>
        </section>
      </div>
    </main>
  )
}

export default RoleHomePage
