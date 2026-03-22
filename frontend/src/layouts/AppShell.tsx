import { BellRing, BookOpenCheck, GraduationCap, LayoutDashboard, LogOut, Settings2, ShieldCheck, UserRound } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/auth/auth-context'
import { appConfig } from '@/config/env'
import { cn } from '@/lib/utils'
import { roleLabels, type AppRole } from '@/app/auth/roles'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

type NavigationItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard
}

const navigationByRole: Record<AppRole, NavigationItem[]> = {
  admin: [
    { to: '/app/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { to: '/app/admin', label: 'Điều hành học vụ', icon: ShieldCheck },
    { to: '/app/lecturer', label: 'Giảng viên', icon: GraduationCap },
    { to: '/app/student', label: 'Sinh viên', icon: BookOpenCheck },
  ],
  lecturer: [
    { to: '/app/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { to: '/app/lecturer', label: 'Lớp phụ trách', icon: GraduationCap },
    { to: '/app/student', label: 'Sinh viên', icon: BookOpenCheck },
  ],
  advisor: [
    { to: '/app/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { to: '/app/lecturer', label: 'Công việc cố vấn', icon: GraduationCap },
    { to: '/app/student', label: 'Sinh viên', icon: BookOpenCheck },
  ],
  student: [
    { to: '/app/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { to: '/app/student', label: 'Học tập cá nhân', icon: BookOpenCheck },
  ],
}

const shellLabels: Record<AppRole, { eyebrow: string; title: string; note: string }> = {
  admin: {
    eyebrow: 'Khu vực quản trị',
    title: 'Điều hành đào tạo theo thời gian thực',
    note: 'Theo dõi lớp học, điểm danh và các cảnh báo cần xử lý trong ngày.',
  },
  lecturer: {
    eyebrow: 'Khu vực giảng viên',
    title: 'Theo dõi lớp phụ trách và tiến độ giảng dạy',
    note: 'Rà soát buổi học, điểm danh và các việc cần hoàn tất trước khi kết thúc ca.',
  },
  advisor: {
    eyebrow: 'Khu vực cố vấn',
    title: 'Theo dõi sinh viên và cảnh báo học vụ',
    note: 'Xem nhanh danh sách sinh viên cần hỗ trợ và các mốc công việc cố vấn trong kỳ.',
  },
  student: {
    eyebrow: 'Khu vực sinh viên',
    title: 'Theo dõi lịch học và trạng thái học tập',
    note: 'Xem lịch học, điểm danh và các mục cần hoàn thành trong học kỳ hiện tại.',
  },
}

export function AppShell() {
  const navigate = useNavigate()
  const { role, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  if (!role) {
    return null
  }

  const navigationItems = navigationByRole[role]
  const shellCopy = shellLabels[role]

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <aside className="hidden w-80 shrink-0 rounded-[2rem] border border-sidebar-border/80 bg-sidebar/95 p-6 text-sidebar-foreground shadow-[0_24px_60px_rgba(15,23,42,0.08)] lg:flex lg:flex-col">
        <div className="flex flex-col gap-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sidebar-border/70 bg-sidebar-accent/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <ShieldCheck />
            {appConfig.appName}
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-3xl text-foreground">{shellCopy.title}</h1>
            <p className="text-sm leading-6 text-muted-foreground">{shellCopy.note}</p>
          </div>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-sidebar-border/70 bg-sidebar-accent/70 p-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback>{roleLabels[role].slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Phiên đăng nhập</p>
              <p className="truncate text-sm font-semibold text-foreground">{roleLabels[role]}</p>
              <Badge variant="secondary" className="w-fit">Phiên đăng nhập đang hoạt động</Badge>
            </div>
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-[0_10px_25px_rgba(37,99,235,0.22)]'
                      : 'text-foreground hover:bg-sidebar-accent',
                  )
                }
              >
                <Icon />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="flex flex-col gap-4 rounded-[1.5rem] border border-sidebar-border/70 bg-background/70 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BellRing />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-foreground">Trạng thái hệ thống</p>
              <p className="text-sm leading-6 text-muted-foreground">Điểm danh, lịch học và cảnh báo học vụ đang sẵn sàng để rà soát.</p>
            </div>
          </div>
          <Button variant="outline" className="justify-start" onClick={() => void handleLogout()}>
            <LogOut data-icon="inline-start" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      <div className="flex min-h-[calc(100vh-3rem)] flex-1 flex-col gap-4">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/82 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{appConfig.appName}</BreadcrumbPage>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{roleLabels[role]}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{shellCopy.eyebrow}</p>
                <h2 className="font-heading text-3xl text-foreground">Không gian làm việc sau đăng nhập</h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">Học kỳ hiện tại</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-11 rounded-2xl px-3">
                    <Avatar>
                      <AvatarFallback>{roleLabels[role].slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <span>{roleLabels[role]}</span>
                    <UserRound data-icon="inline-end" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-56">
                  <DropdownMenuLabel>Tài khoản hiện tại</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <UserRound data-icon="inline-start" />
                      {roleLabels[role]}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings2 data-icon="inline-start" />
                      Cấu hình hiển thị
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => void handleLogout()}>
                    <LogOut data-icon="inline-start" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Separator />
          <p className="max-w-4xl text-sm leading-6 text-muted-foreground">{shellCopy.note}</p>
        </header>

        <div className="flex-1 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
