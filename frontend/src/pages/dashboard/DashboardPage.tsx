import { useEffect, useState } from 'react'
import {
  BookOpenCheck,
  CalendarClock,
  GraduationCap,
  House,
  Megaphone,
  School,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ApiError } from '@/app/auth/auth-api'
import { useAuth } from '@/app/auth/auth-provider'
import { getDashboardStatsApi, getRegistrationPeriodsListApi } from '@/app/dashboard/dashboard-api'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { SubjectManagementSection } from '@/pages/subjects/SubjectManagementSection'
import { DashboardTopBar } from '@/pages/dashboard/DashboardTopBar'

function isSessionFatalError(error: unknown) {
  return error instanceof ApiError && (error.code === 'SESSION_EXPIRED' || error.code === 'UNAUTHORIZED')
}

const sidebarItems = [
  { to: '/dashboard', label: 'Tổng quan', icon: House },
  { to: '/dashboard/hoc-phan', label: 'Quản lý môn học', icon: BookOpenCheck },
  { to: '/dashboard/lop-hanh-chinh', label: 'Lớp hành chính', icon: School },
  { to: '/dashboard/co-van', label: 'Cố vấn học tập', icon: Users },
  { to: '/dashboard/thong-bao', label: 'Thông báo', icon: Megaphone },
]

const pageTitles: Record<string, string> = {
  '/dashboard': 'Tổng quan hệ thống',
  '/dashboard/hoc-phan': 'Quản lý môn học',
  '/dashboard/lop-hanh-chinh': 'Quản lý lớp hành chính',
  '/dashboard/co-van': 'Quản lý cố vấn học tập',
  '/dashboard/thong-bao': 'Trung tâm thông báo',
}

export function DashboardPage() {
  const { user, logout, accessToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname
  const [stats, setStats] = useState<{
    subjectCount: number
    courseOfferingCount: number
    administrativeClassCount: number
    openRegistrationPeriodCount: number
  } | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [openPeriodPreview, setOpenPeriodPreview] = useState<{ id: string; label: string }[]>([])

  useEffect(() => {
    if (!accessToken) {
      setStats(null)
      setStatsLoading(false)
      return
    }

    let cancelled = false
    setStatsLoading(true)

    void Promise.all([getDashboardStatsApi(), getRegistrationPeriodsListApi()])
      .then(([summary, periods]) => {
        if (cancelled) return
        setStats(summary)
        const open = periods.items.filter((p) => p.status === 'OPEN')
        const preview = open.slice(0, 5).map((p) => {
          const start = new Date(p.startDate).toLocaleDateString('vi-VN')
          const end = new Date(p.endDate).toLocaleDateString('vi-VN')
          return {
            id: p.id,
            label: `${p.periodName} (${p.semesterLabel}, ${p.academicYear.yearName}): ${start} — ${end}`,
          }
        })
        setOpenPeriodPreview(
          preview.length > 0
            ? preview
            : [{ id: 'empty', label: 'Hiện không có đợt đăng ký nào đang ở trạng thái mở.' }],
        )
      })
      .catch((error) => {
        if (!isSessionFatalError(error)) {
          const message = error instanceof ApiError ? error.message : 'Không tải được số liệu tổng quan.'
          toast.error(message)
        }
        if (!cancelled) setStats(null)
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [accessToken])
  const isSubjectManagement = pathname === '/dashboard/hoc-phan' || pathname.startsWith('/dashboard/hoc-phan/')

  const currentTitle =
    pageTitles[
      Object.keys(pageTitles).find((key) => pathname === key || pathname.startsWith(`${key}/`)) ??
        '/dashboard'
    ] ?? 'Tổng quan hệ thống'

  const isOverviewHome = pathname === '/dashboard' || pathname === '/dashboard/'

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-muted/30 p-4 md:p-8">
      <DashboardTopBar
        title={currentTitle}
        fullName={user.fullName}
        username={user.username}
        email={user.email}
        roleName={user.role.name}
        onLogout={() => logout()}
      />
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader className="gap-3">
            <Badge variant="secondary" className="w-fit">
              Menu hệ thống
            </Badge>
            <CardTitle className="text-base">Điều hướng nghiệp vụ</CardTitle>
            <CardDescription>Chọn nhóm chức năng ở thanh bên trái.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  onClick={() => {
                    if (location.pathname !== item.to) {
                      toast.info(`Đang chuyển đến: ${item.label}`)
                    }
                  }}
                  className={({ isActive }) =>
                    cn(
                      'group inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all duration-200 ease-out hover:-translate-y-px active:translate-y-0',
                      isActive
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border text-foreground hover:border-primary/40 hover:bg-muted',
                    )
                  }
                >
                  <Icon className="size-4 transition-transform duration-200 group-hover:scale-105" />
                  {item.label}
                </NavLink>
              )
            })}
            <Button variant="outline" onClick={() => logout()} className="mt-2 justify-start">
              Đăng xuất
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          {isSubjectManagement ? (
            <SubjectManagementSection />
          ) : isOverviewHome ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="secondary">Bảng điều khiển</Badge>
                  </div>
                  <CardTitle className="text-2xl">{currentTitle}</CardTitle>
                  <CardDescription>Xin chào, {user.fullName}. Vai trò hiện tại: {user.role.name}.</CardDescription>
                </CardHeader>
              </Card>

              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Môn học (danh mục)</CardTitle>
                    <CardDescription className="text-2xl font-semibold text-foreground">
                      {statsLoading ? '…' : stats?.subjectCount ?? '—'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Tổng số môn học đang có trong hệ thống
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Lớp học phần</CardTitle>
                    <CardDescription className="text-2xl font-semibold text-foreground">
                      {statsLoading ? '…' : stats?.courseOfferingCount ?? '—'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">Lớp học phần đã mở trong hệ thống</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Lớp hành chính</CardTitle>
                    <CardDescription className="text-2xl font-semibold text-foreground">
                      {statsLoading ? '…' : stats?.administrativeClassCount ?? '—'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">Lớp sinh hoạt hành chính theo dữ liệu hiện tại</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Đợt ĐK đang mở</CardTitle>
                    <CardDescription className="text-2xl font-semibold text-foreground">
                      {statsLoading ? '…' : stats?.openRegistrationPeriodCount ?? '—'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Số đợt đăng ký học phần ở trạng thái mở
                  </CardContent>
                </Card>
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CalendarClock className="size-4 text-primary" />
                      Đợt đăng ký đang mở
                    </CardTitle>
                    <CardDescription>Dữ liệu từ API đợt đăng ký (tối đa 5 dòng).</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 text-sm">
                    {statsLoading ? (
                      <p className="text-muted-foreground">Đang tải...</p>
                    ) : (
                      openPeriodPreview.map((row) => (
                        <p key={row.id} className="text-muted-foreground">
                          — {row.label}
                        </p>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BookOpenCheck className="size-4 text-primary" />
                      Tác vụ nhanh
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => navigate('/dashboard/hoc-phan')}
                    >
                      <BookOpenCheck data-icon="inline-start" />
                      Quản lý danh mục môn học
                    </Button>
                    <Button variant="outline" className="justify-start" disabled>
                      <GraduationCap data-icon="inline-start" />
                      Đăng ký học phần (sắp có)
                    </Button>
                    <Button variant="outline" className="justify-start" disabled>
                      <ShieldCheck data-icon="inline-start" />
                      Đợt đăng ký (sắp có)
                    </Button>
                    <Button variant="outline" className="justify-start" disabled>
                      <CalendarClock data-icon="inline-start" />
                      Lịch học (sắp có)
                    </Button>
                  </CardContent>
                </Card>
              </section>

              <Alert>
                <ShieldCheck data-icon="inline-start" />
                <AlertTitle>Lưu ý bảo mật phiên làm việc</AlertTitle>
                <AlertDescription>
                  Không chia sẻ tài khoản cho người khác và luôn đăng xuất khi hoàn thành tác vụ trên thiết bị dùng chung.
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{currentTitle}</CardTitle>
                <CardDescription>
                  Trang này chưa được nối module đầy đủ. Bạn có thể quay lại <span className="font-medium text-foreground">Tổng quan</span> hoặc chọn chức năng khác ở menu bên trái.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Nếu bạn muốn mình nối API và làm tiếp từng module (lớp hành chính, cố vấn học tập, thông báo) thì nói mình biết theo thứ tự ưu tiên.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
