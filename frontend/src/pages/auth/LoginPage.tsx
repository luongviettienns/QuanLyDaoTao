import { useState } from 'react'
import { CircleCheck, Headset, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ApiError } from '@/app/auth/auth-api'
import { useAuth } from '@/app/auth/auth-provider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

type FormState = {
  identifier: string
  password: string
  rememberMe: boolean
}

const initialForm: FormState = {
  identifier: '',
  password: '',
  rememberMe: false,
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState<FormState>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      await login(form)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
        toast.error(error.message)
      } else {
        setErrorMessage('Không thể đăng nhập. Vui lòng thử lại.')
        toast.error('Không thể đăng nhập. Vui lòng thử lại.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/30 px-4 py-8 md:px-8">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="hidden lg:flex">
          <CardHeader className="gap-3">
            <Badge variant="secondary" className="w-fit">
              Cổng đào tạo trực tuyến
            </Badge>
            <CardTitle className="text-2xl">Hệ thống Quản lý Đào tạo</CardTitle>
            <CardDescription>
              Quản lý đăng ký học phần, lớp hành chính, cố vấn học tập và các tác vụ đào tạo trong một nền tảng tập trung.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Alert>
              <CircleCheck data-icon="inline-start" />
              <AlertTitle>Đợt đăng ký học phần đang mở</AlertTitle>
              <AlertDescription>
                Học kỳ 2 năm học 2025-2026: từ 08:00 ngày 25/03/2026 đến 23:59 ngày 31/03/2026.
              </AlertDescription>
            </Alert>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="text-sm">Đối tượng sử dụng</CardTitle>
                  <CardDescription>Sinh viên, giảng viên, cố vấn và quản trị viên.</CardDescription>
                </CardHeader>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="text-sm">Yêu cầu đăng nhập</CardTitle>
                  <CardDescription>Mã người dùng hoặc email công vụ, kèm mật khẩu đã cấp.</CardDescription>
                </CardHeader>
              </Card>
            </div>
            <Separator />
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <Headset className="mt-0.5 size-4" />
              <p>Hỗ trợ kỹ thuật: 028 3888 1020 (08:00 - 17:00) hoặc email hotro@ql-daotao.edu.vn.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mx-auto w-full max-w-xl">
          <CardHeader className="gap-3">
            <div className="flex items-center justify-between gap-2">
              <Badge>Đăng nhập an toàn</Badge>
              <span className="text-xs text-muted-foreground">Phiên bản 2026.03</span>
            </div>
            <CardTitle className="text-2xl">Đăng nhập hệ thống</CardTitle>
            <CardDescription>
              Sử dụng tài khoản được nhà trường cấp để truy cập các chức năng nghiệp vụ đào tạo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="identifier">Tài khoản hoặc email</Label>
                <Input
                  id="identifier"
                  type="text"
                  value={form.identifier}
                  onChange={(event) => setForm((prev) => ({ ...prev, identifier: event.target.value }))}
                  placeholder="Ví dụ: sv000123 hoặc sv000123@ql-daotao.edu.vn"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Nhập mật khẩu của bạn"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rememberMe"
                    checked={form.rememberMe}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, rememberMe: checked === true }))}
                  />
                  <Label htmlFor="rememberMe">Ghi nhớ đăng nhập 30 ngày</Label>
                </div>
                <button type="button" className="text-sm text-primary hover:underline">
                  Quên mật khẩu?
                </button>
              </div>

              {errorMessage ? (
                <Alert variant="destructive">
                  <LockKeyhole data-icon="inline-start" />
                  <AlertTitle>Đăng nhập thất bại</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              ) : null}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Đang xác thực tài khoản...' : 'Đăng nhập'}
              </Button>

              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                <p>
                  Dữ liệu được bảo vệ theo chính sách an toàn thông tin của nhà trường. Vui lòng đăng xuất sau khi dùng trên
                  máy công cộng.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
