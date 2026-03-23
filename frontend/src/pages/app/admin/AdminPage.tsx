import { ArrowRight, CalendarClock, FolderKanban, GraduationCap, LibraryBig, ListChecks, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { SectionCard } from '@/components/dashboard/SectionCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'

const adminStats = [
  {
    label: 'Môn học',
    value: 'API sẵn sàng',
    note: 'Đã có backend quản lý danh mục môn học và sẵn sàng để gắn vào giao diện quản trị.',
    icon: LibraryBig,
    status: { tone: 'done' as const, text: 'Backend OK' },
  },
  {
    label: 'Lớp hành chính',
    value: 'API sẵn sàng',
    note: 'Danh sách lớp hành chính, chi tiết lớp và sinh viên theo lớp đã có ở backend.',
    icon: Users,
    status: { tone: 'done' as const, text: 'Backend OK' },
  },
  {
    label: 'Lớp học phần',
    value: 'API sẵn sàng',
    note: 'Backend lớp học phần đã có danh sách, chi tiết và thao tác quản trị cơ bản.',
    icon: GraduationCap,
    status: { tone: 'today' as const, text: 'Đang tích hợp UI' },
  },
  {
    label: 'Đăng ký học phần',
    value: 'Quy trình đã khép kín',
    note: 'Đợt đăng ký, gắn lớp vào đợt và đăng ký/hủy học phần đã có backend để nối vào giao diện admin.',
    icon: ListChecks,
    status: { tone: 'attention' as const, text: 'Cần dashboard admin' },
  },
]

const adminQuickActions = [
  {
    title: 'Mở danh mục môn học',
    description: 'Rà soát mã môn, tín chỉ và bộ môn phụ trách đang dùng trong hệ thống.',
    icon: LibraryBig,
  },
  {
    title: 'Xem lớp hành chính',
    description: 'Theo dõi quy mô lớp, cố vấn học tập và phân bố sinh viên theo từng khoá.',
    icon: Users,
  },
  {
    title: 'Quản lý lớp học phần',
    description: 'Theo dõi lớp mở theo kỳ, giảng viên phụ trách và sức chứa hiện tại.',
    icon: GraduationCap,
  },
  {
    title: 'Điều hành đợt đăng ký',
    description: 'Rà soát đợt đăng ký mở, lớp đã gắn vào period và trạng thái enrollment.',
    icon: CalendarClock,
  },
]

const adminModules = [
  {
    title: 'Môn học',
    description: 'Quản lý danh mục môn học đang dùng cho lớp học phần.',
    to: '/app/admin/subjects',
    tone: 'done' as const,
    label: 'Sẵn sàng tích hợp',
  },
  {
    title: 'Lớp hành chính',
    description: 'Rà soát lớp theo khoá, ngành và cố vấn học tập.',
    to: '/app/admin/homeroom-classes',
    tone: 'done' as const,
    label: 'Sẵn sàng tích hợp',
  },
  {
    title: 'Dữ liệu học vụ',
    description: 'Theo dõi niên khoá, năm học, học kỳ và đợt đăng ký hiện tại.',
    to: '/app/admin/academic-data',
    tone: 'today' as const,
    label: 'Đang dùng API nền',
  },
  {
    title: 'Lớp học phần',
    description: 'Theo dõi lớp học phần mở theo môn, giảng viên và sức chứa.',
    to: '/app/admin/course-sections',
    tone: 'today' as const,
    label: 'Đang dùng API nền',
  },
  {
    title: 'Đợt đăng ký',
    description: 'Rà soát trạng thái period, mở/đóng và lớp được gắn vào period.',
    to: '/app/admin/registration-periods',
    tone: 'attention' as const,
    label: 'Quy trình trọng tâm',
  },
  {
    title: 'Đăng ký học phần',
    description: 'Theo dõi enrollment và chuẩn bị tích hợp dashboard tra cứu toàn cục.',
    to: '/app/admin/course-registrations',
    tone: 'attention' as const,
    label: 'Đang hoàn thiện UI',
  },
]

export function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        eyebrow="Bảng điều hành quản trị"
        title="Điều hành danh mục đào tạo và học phần"
        description="Dashboard admin tập trung vào các module đã có backend: môn học, lớp hành chính, dữ liệu học vụ, lớp học phần, đợt đăng ký và đăng ký học phần."
        meta="Sprint 3 · tích hợp backend vào khu vực quản trị"
        action={
          <NavLink to="/app/admin/registration-periods">
            <Button>
              <CalendarClock data-icon="inline-start" />
              Mở điều hành đăng ký
            </Button>
          </NavLink>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <Alert className="rounded-[1.75rem] border-border/80 bg-accent/70 px-4 py-4 sm:px-5">
        <FolderKanban />
        <AlertTitle>Trọng tâm vận hành hiện tại</AlertTitle>
        <AlertDescription>
          Ưu tiên rà soát danh mục đào tạo, lớp học phần và trạng thái đợt đăng ký trước khi mở rộng sang dashboard báo cáo và giao diện sinh viên.
        </AlertDescription>
      </Alert>

      <QuickActions
        title="Tác vụ nhanh"
        description="Các lối vào chính để rà soát dữ liệu đào tạo và quy trình đăng ký học phần trong khu vực admin."
        actions={adminQuickActions}
      />

      <SectionCard title="Các module quản trị hiện có" description="Những khu vực admin đã có backend và đang được đưa vào sidebar menu.">
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {adminModules.map((module) => (
            <NavLink
              key={module.to}
              to={module.to}
              className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4 transition-colors hover:bg-accent/55"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <p className="font-medium text-foreground">{module.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{module.description}</p>
                </div>
                <StatusBadge tone={module.tone}>{module.label}</StatusBadge>
              </div>
            </NavLink>
          ))}
        </div>
      </SectionCard>

      <NavLink to="/app/admin/subjects" className="w-fit">
        <Button variant="ghost" className="w-fit self-start">
          Đi tới quản trị danh mục
          <ArrowRight data-icon="inline-end" />
        </Button>
      </NavLink>
    </div>
  )
}
