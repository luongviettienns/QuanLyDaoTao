import { useMemo, useState } from 'react'
import { App as AntApp, Button, Card, Space, Typography } from 'antd'
import { LoginPage } from './pages/LoginPage'
import type { LoginResponse } from './types/auth'

const STORAGE_KEY = 'edu-auth-session'

type StoredSession = {
  rememberMe: boolean
  user: LoginResponse
}

function readStoredSession(): LoginResponse | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue =
    window.localStorage.getItem(STORAGE_KEY) ||
    window.sessionStorage.getItem(STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as StoredSession
    return parsed.user ?? null
  } catch {
    return null
  }
}

function clearStoredSession() {
  window.localStorage.removeItem(STORAGE_KEY)
  window.sessionStorage.removeItem(STORAGE_KEY)
}

function persistSession(user: LoginResponse, rememberMe: boolean) {
  clearStoredSession()

  const storage = rememberMe ? window.localStorage : window.sessionStorage
  storage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      rememberMe,
      user,
    } satisfies StoredSession),
  )
}

const infoRows = [
  { label: 'Username', key: 'username' },
  { label: 'Ho ten', key: 'fullName' },
  { label: 'Vai tro', key: 'role' },
  { label: 'User ID', key: 'userId' },
] as const

export function App() {
  const [user, setUser] = useState<LoginResponse | null>(() => readStoredSession())
  const currentUser = useMemo(() => user, [user])

  const handleLoginSuccess = (nextUser: LoginResponse, rememberMe: boolean) => {
    persistSession(nextUser, rememberMe)
    setUser(nextUser)
  }

  const handleLogout = () => {
    clearStoredSession()
    setUser(null)
  }

  return (
    <AntApp>
      <LoginPage user={currentUser} onLoginSuccess={handleLoginSuccess} />

      {currentUser ? (
        <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-20 flex justify-center px-2">
          <Card className="pointer-events-auto w-full max-w-3xl rounded-3xl border-0 bg-slate-950/88 text-white shadow-2xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <Typography.Text className="!text-xs !uppercase !tracking-[0.28em] !text-slate-400">
                  Session preview
                </Typography.Text>
                <Typography.Title level={4} className="!mb-1 !mt-2 !text-white">
                  Da ket noi backend thanh cong
                </Typography.Title>
                <Typography.Paragraph className="!mb-0 !text-slate-300">
                  Du lieu duoc luu tam de ban tiep tuc ghep routing va dashboard.
                </Typography.Paragraph>
              </div>

              <Space wrap size={[12, 12]}>
                {infoRows.map((item) => (
                  <div key={item.key} className="min-w-[120px]">
                    <Typography.Text className="!block !text-[11px] !uppercase !tracking-[0.16em] !text-slate-500">
                      {item.label}
                    </Typography.Text>
                    <Typography.Text className="!text-sm !font-medium !text-white">
                      {currentUser[item.key] || '-'}
                    </Typography.Text>
                  </div>
                ))}
              </Space>

              <Button size="large" onClick={handleLogout} className="!rounded-2xl">
                Dang xuat
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </AntApp>
  )
}
