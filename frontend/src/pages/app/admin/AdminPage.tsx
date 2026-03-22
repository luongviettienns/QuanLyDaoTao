import { ArrowRight, BellRing, ClipboardCheck, Download, ShieldAlert, Waypoints } from 'lucide-react'
import { adminAlerts, adminAnnouncements, adminQuickActions, adminSchedules, adminStats } from '@/pages/app/admin/admin-dashboard.mock'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { AlertList } from '@/components/dashboard/AlertList'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { ScheduleList } from '@/components/dashboard/ScheduleList'
import { SectionCard } from '@/components/dashboard/SectionCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'

export function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        eyebrow="Bảng điều hành quản trị"
        title="Tình trạng vận hành đào tạo hôm nay"
        description="Rà soát nhanh lớp học đang diễn ra, các cảnh báo học vụ và những việc cần ưu tiên xử lý trong ngày."
        meta="Cập nhật theo phiên đăng nhập giả lập"
        action={
          <Button>
            <Download data-icon="inline-start" />
            Xuất báo cáo nhanh
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        {adminStats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <Alert className="rounded-[1.75rem] border-border/80 bg-accent/70 px-4 py-4 sm:px-5">
        <ShieldAlert />
        <AlertTitle>Cần xử lý ngay trong đầu ca</AlertTitle>
        <AlertDescription>
          12 lớp chưa chốt điểm danh, 7 sinh viên vượt ngưỡng vắng và 3 lịch học vừa thay đổi phòng. Ưu tiên rà soát trước khi phát sinh sai lệch dữ liệu học vụ.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <QuickActions
            title="Tác vụ quản trị ưu tiên"
            description="Các thao tác thường dùng để giữ dữ liệu lớp học, điểm danh và thông báo ở trạng thái đồng bộ."
            actions={adminQuickActions}
          />

          <SectionCard
            title="Lớp và mốc cần chú ý"
            description="Những đầu việc cần nhà trường hoặc phòng đào tạo rà soát trước khi chốt dữ liệu cuối ngày."
            action={
              <Button variant="outline">
                <Waypoints data-icon="inline-start" />
                Mở danh sách chi tiết
              </Button>
            }
          >
            <div className="grid gap-3">
              <div className="flex flex-col gap-3 rounded-[1.5rem] border border-border/70 bg-background/75 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1.5">
                  <p className="font-medium text-foreground">Khối CNTT · 4 lớp thực hành đổi phòng</p>
                  <p className="text-sm leading-6 text-muted-foreground">Cần đồng bộ lại phòng máy trước ca chiều để tránh trùng lịch và sai thông báo sinh viên.</p>
                </div>
                <StatusBadge tone="attention">Đang rà soát</StatusBadge>
              </div>
              <div className="flex flex-col gap-3 rounded-[1.5rem] border border-border/70 bg-background/75 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1.5">
                  <p className="font-medium text-foreground">Báo cáo điểm danh tuần 8</p>
                  <p className="text-sm leading-6 text-muted-foreground">Dữ liệu từ 2 bộ môn chưa được chốt, cần hoàn tất trước 17:30 để chuyển cảnh báo học vụ.</p>
                </div>
                <StatusBadge tone="critical">Hạn cuối hôm nay</StatusBadge>
              </div>
              <div className="flex flex-col gap-3 rounded-[1.5rem] border border-border/70 bg-background/75 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1.5">
                  <p className="font-medium text-foreground">Danh sách sinh viên vượt ngưỡng vắng</p>
                  <p className="text-sm leading-6 text-muted-foreground">Đã phát sinh thêm 7 sinh viên cần thông báo tới cố vấn học tập trong buổi sáng.</p>
                </div>
                <StatusBadge tone="today">Trong ngày</StatusBadge>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <AlertList
            title="Cảnh báo vận hành"
            description="Các điểm cần theo dõi liên quan tới điểm danh, lịch học và trạng thái học vụ."
            items={adminAlerts}
          />

          <ScheduleList
            title="Lịch công việc trong ngày"
            description="Các mốc kiểm tra dữ liệu và chốt báo cáo cần theo dõi trong phiên làm việc hiện tại."
            items={adminSchedules}
          />

          <SectionCard title="Thông báo nội bộ" description="Những cập nhật cần phổ biến tới khoa, bộ môn và tài khoản quản trị.">
            <div className="flex flex-col gap-3">
              {adminAnnouncements.map((item) => (
                <article key={item.title} className="flex items-start gap-4 rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <item.icon />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <StatusBadge tone={item.tone}>{item.meta}</StatusBadge>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Tóm tắt cuối phiên" description="Ba nhóm chỉ số cần giữ ổn định trước khi kết thúc ngày làm việc.">
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ClipboardCheck />
              </div>
              <div>
                <p className="font-medium text-foreground">Điểm danh đã chốt</p>
                <p className="text-sm text-muted-foreground">52 / 64 buổi học hôm nay</p>
              </div>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldAlert />
              </div>
              <div>
                <p className="font-medium text-foreground">Cảnh báo cần xử lý</p>
                <p className="text-sm text-muted-foreground">27 mục ưu tiên, 9 mục ở mức cao</p>
              </div>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BellRing />
              </div>
              <div>
                <p className="font-medium text-foreground">Thông báo đang chờ phát hành</p>
                <p className="text-sm text-muted-foreground">3 thông báo sẽ gửi sau khi rà soát xong dữ liệu</p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <Button variant="ghost" className="w-fit self-start">
        Xem toàn bộ điều hành học vụ
        <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  )
}
