import { useMemo, useState } from 'react'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/auth/auth-context'
import { defaultRoleRoute } from '@/app/auth/roles'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

const supportItems = [
  'Quên mật khẩu?',
  'Tài khoản bị khóa?',
  'Liên hệ quản trị hệ thống',
]

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isSubmitting, error, clearError } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const redirectTo = useMemo(() => {
    const nextPath = (location.state as { from?: string } | null)?.from

    if (nextPath && nextPath.startsWith('/app')) {
      return nextPath
    }

    return null
  }, [location.state])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const authUser = await login({
        identifier,
        password,
        rememberMe,
      })

      navigate(redirectTo ?? defaultRoleRoute[authUser.appRole], { replace: true })
    } catch {
      // lỗi đã được lưu trong auth context
    }
  }

  return (
    <section className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid w-full gap-4 lg:grid-cols-[minmax(280px,0.72fr)_minmax(460px,560px)] lg:items-center">
        <div className="hidden lg:block">
          <div className="max-w-md space-y-4 rounded-[2rem] border border-white/50 bg-white/45 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/4 dark:shadow-[0_24px_70px_rgba(2,6,23,0.4)]">
            <div className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
              EducationWebsite
            </div>
            <div className="space-y-2">
              <h1 className="font-heading text-4xl leading-tight text-slate-950 dark:text-slate-50">
                Đăng nhập hệ thống
              </h1>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                Dùng tài khoản được cấp để đăng nhập.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full lg:justify-self-end">
          <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 py-0 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:shadow-[0_30px_80px_rgba(2,6,23,0.5)]">
            <CardHeader className="space-y-5 border-b border-slate-200/80 px-7 pt-7 pb-6 sm:px-8 sm:pt-8 dark:border-white/10">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="inline-flex items-center rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    Đăng nhập
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="font-heading text-4xl leading-tight text-slate-950 dark:text-slate-50">
                      Đăng nhập
                    </CardTitle>
                    <CardDescription className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Nhập thông tin đăng nhập.
                    </CardDescription>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-right text-xs leading-5 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  <p>Phiên bảo mật</p>
                  <p>Kiểm tra quyền sau xác thực</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-7 pt-7 pb-7 sm:px-8">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="identifier" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Tài khoản
                  </label>
                  <Input
                    id="identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="Ví dụ: admin01 hoặc giangvien01"
                    className="h-12 rounded-2xl border-slate-200 bg-white/80 px-4 dark:border-white/10 dark:bg-white/5"
                    value={identifier}
                    onChange={(event) => {
                      clearError()
                      setIdentifier(event.target.value)
                    }}
                  />
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Nhập email hoặc mã tài khoản.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                      onClick={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Nhập mật khẩu"
                      className="h-12 rounded-2xl border-slate-200 bg-white/80 px-4 pr-12 dark:border-white/10 dark:bg-white/5"
                      value={password}
                      onChange={(event) => {
                        clearError()
                        setPassword(event.target.value)
                      }}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="absolute top-1/2 right-3 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100"
                      onClick={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                    <Checkbox checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} />
                    Ghi nhớ đăng nhập
                  </label>
                  <button
                    type="button"
                    className="text-left text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-100 sm:text-right"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                {error ? (
                  <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5">
                    <AlertTitle>Không thể đăng nhập</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                <Button
                  className="h-12 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang xác thực' : 'Đăng nhập'}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </form>

              <div className="mt-6 grid gap-2 rounded-[1.5rem] border border-slate-200/80 bg-white/72 px-4 py-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Hỗ trợ</p>
                <ul className="grid gap-1.5">
                  {supportItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
