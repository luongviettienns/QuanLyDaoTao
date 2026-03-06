import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState('Đang kiểm tra kết nối backend...')

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/health')
        const data = await response.json()
        setHealth(data.message)
      } catch {
        setHealth('Không kết nối được backend')
      }
    }

    fetchHealth()
  }, [])

  return (
    <main className="container">
      <h1>Hệ thống Quản lý điểm danh sinh viên</h1>
      <p>Frontend (React + Vite) đã khởi tạo thành công.</p>
      <p>Backend status: {health}</p>
    </main>
  )
}

export default App
