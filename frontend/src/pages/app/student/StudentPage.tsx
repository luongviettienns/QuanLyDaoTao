import { ArrowRight, BookOpenCheck, CalendarClock, ClipboardList, GraduationCap, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { AlertList } from '@/components/dashboard/AlertList'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { ScheduleList } from '@/components/dashboard/ScheduleList'
import { SectionCard } from '@/components/dashboard/SectionCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'

const studentStats = [
  {
    label: 'Tín chỉ đang học',
    value: '18',
    note: 'Khối lượng học tập của học kỳ hiện tại, bao gồm cả môn chuyên ngành và thực hành.',
    icon: GraduationCap,
    status: { tone: 'today' as const, text: 'Học kỳ 2' },
  },
  {
    label: 'Tỷ lệ điểm danh',
    value: '92%',
    note: 'Tỷ lệ chuyên cần trung bình trên toàn bộ học phần đang theo học.',
    icon: ClipboardList,
    status: { tone: 'done' as const, text: 'Ổn định' },
  },
  {
    label: 'Buổi học tiếp theo',
    value: '08:30',
    note: 'Môn Phân tích thiết kế hệ thống tại phòng B3-204 trong sáng nay.',
    icon: CalendarClock,
    status: { tone: 'today' as const, text: 'Hôm nay' },
  },
  {
    label: 'Mục cần xem',
    value: '3',
    note: 'Gồm lịch đổi phòng, nhắc chuyên cần và một cập nhật điểm thành phần mới.',
    icon: ShieldAlert,
    status: { tone: 'attention' as const, text: 'Cần chú ý' },
  },
]

const studentActions = [
  {
    title: 'Xem thời khóa biểu tuần',
    description: 'Mở nhanh lịch học hiện tại để rà soát ca học, phòng học và thay đổi mới phát sinh.',
    icon: CalendarClock,
  },
  {
    title: 'Kiểm tra điểm danh cá nhân',
    description: 'Đối chiếu số buổi có mặt, vắng học và các học phần đang gần ngưỡng cảnh báo.',
    icon: ClipboardList,
  },
  {
    title: 'Theo dõi kết quả học tập',
    description: 'Xem các đầu điểm mới được cập nhật và những học phần cần cải thiện trong kỳ.',
    icon: BookOpenCheck,
  },
  {
    title: 'Gửi yêu cầu học vụ',
    description: 'Chuẩn bị các thao tác như xác nhận lịch, đơn từ hoặc rà soát dữ liệu cá nhân.',
    icon: ShieldAlert,
  },
]

const studentAlerts = [
  {
    title: 'Môn Cơ sở dữ liệu thay đổi phòng học',
    description: 'Buổi học chiều nay chuyển sang phòng A2-305, cần có mặt trước 10 phút để ổn định chỗ ngồi.',
    meta: 'Lịch học hôm nay',
    tone: 'today' as const,
    icon: CalendarClock,
  },
  {
    title: 'Điểm danh môn Mạng máy tính đang ở ngưỡng cần chú ý',
    description: 'Bạn đã có 2 buổi vắng, cần đảm bảo có mặt đủ các buổi còn lại để không vượt ngưỡng chuyên cần.',
    meta: 'Cảnh báo chuyên cần',
    tone: 'attention' as const,
    icon: ShieldAlert,
  },
  {
    title: 'Điểm thành phần mới đã được cập nhật',
    description: 'Bài tập lớn môn Phân tích thiết kế hệ thống đã có điểm và đang chờ bạn xác nhận lại thông tin.',
    meta: 'Kết quả học tập',
    tone: 'normal' as const,
    icon: BookOpenCheck,
  },
]

const studentSchedule = [
  {
    title: 'Phân tích thiết kế hệ thống',
    subtitle: 'Phòng B3-204 · Giảng viên Nguyễn Thị Hương · ca sáng.',
    time: '08:30 - 10:15',
    tone: 'today' as const,
    statusText: 'Sắp bắt đầu',
    icon: CalendarClock,
  },
  {
    title: 'Hoàn tất rà soát điểm danh cá nhân',
    subtitle: 'Kiểm tra lại các buổi học tuần trước và xác nhận nếu có chênh lệch dữ liệu.',
    time: '14:00',
    tone: 'attention' as const,
    statusText: 'Cần thực hiện',
    icon: ClipboardList,
  },
  {
    title: 'Nộp bài báo cáo nhóm',
    subtitle: 'Môn Công nghệ phần mềm yêu cầu nộp bản cuối trước khi kết thúc ngày học.',
    time: '23:00',
    tone: 'critical' as const,
    statusText: 'Hạn cuối',
    icon: BookOpenCheck,
  },
]

const studyProgress = [
  {
    title: 'Mạng máy tính',
    description: 'Điểm danh 83% · cần giữ đủ chuyên cần ở các buổi thực hành còn lại.',
    tone: 'attention' as const,
    label: 'Cần chú ý',
  },
  {
    title: 'Phân tích thiết kế hệ thống',
    description: 'Điểm thành phần đã cập nhật và lịch học đang ổn định trong tuần này.',
    tone: 'done' as const,
    label: 'Ổn định',
  },
  {
    title: 'Công nghệ phần mềm',
    description: 'Đang chờ nộp báo cáo nhóm, cần hoàn tất trước hạn cuối hôm nay.',
    tone: 'critical' as const,
    label: 'Hạn cuối',
  },
]

export function StudentPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        eyebrow="Tổng quan học tập"
        title="Lịch học, chuyên cần và kết quả cá nhân"
        description="Xem nhanh các buổi học sắp tới, trạng thái điểm danh và những mục cần hoàn thành trong học kỳ hiện tại."
        meta="Dữ liệu minh họa theo vai trò sinh viên"
        action={
          <Button>
            <CalendarClock data-icon="inline-start" />
            Xem thời khóa biểu
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        {studentStats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <SectionCard
        title="Việc cần làm trong hôm nay"
        description="Các việc cần ưu tiên để giữ lịch học và chuyên cần ở trạng thái an toàn."
        action={
          <Button variant="outline">
            <ClipboardList data-icon="inline-start" />
            Mở danh sách cá nhân
          </Button>
        }
      >
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-[1.5rem] border border-border/70 bg-accent/45 p-4">
            <p className="text-sm font-semibold text-foreground">Xác nhận lịch đổi phòng</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Môn Cơ sở dữ liệu chuyển sang phòng A2-305 trong buổi chiều nay.</p>
          </div>
          <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
            <p className="text-sm font-semibold text-foreground">Rà soát điểm danh tuần trước</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Kiểm tra 1 buổi học đang chờ đồng bộ điểm danh từ giảng viên phụ trách.</p>
          </div>
          <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
            <p className="text-sm font-semibold text-foreground">Hoàn tất báo cáo nhóm</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Bài nộp môn Công nghệ phần mềm cần được gửi trước 23:00 hôm nay.</p>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <div className="flex flex-col gap-6">
          <ScheduleList
            title="Lịch học và mốc sắp tới"
            description="Các ca học, việc cần làm và hạn cuối gần nhất trong ngày."
            items={studentSchedule}
          />

          <SectionCard title="Tiến độ học phần" description="Những môn học cần theo dõi thêm về điểm danh, lịch học hoặc đầu điểm mới cập nhật.">
            <div className="flex flex-col gap-3">
              {studyProgress.map((item) => (
                <article key={item.title} className="flex flex-col gap-3 rounded-[1.5rem] border border-border/70 bg-background/75 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-1.5">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                  <StatusBadge tone={item.tone}>{item.label}</StatusBadge>
                </article>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <AlertList
            title="Thông báo và nhắc việc"
            description="Các cập nhật liên quan tới lịch học, chuyên cần và kết quả học tập cá nhân."
            items={studentAlerts}
          />

          <QuickActions
            title="Tác vụ nhanh"
            description="Các thao tác thường dùng để theo dõi lịch học và trạng thái học tập cá nhân."
            actions={studentActions}
          />

          <SectionCard title="Hồ sơ học tập tóm tắt" description="Thông tin học vụ cần xem nhanh trong phiên làm việc hiện tại.">
            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-[1.25rem] border border-border/70 bg-background/75 px-4 py-3">
                <span className="text-sm text-muted-foreground">Mã sinh viên</span>
                <span className="text-sm font-semibold text-foreground">20232045</span>
              </div>
              <div className="flex items-center justify-between rounded-[1.25rem] border border-border/70 bg-background/75 px-4 py-3">
                <span className="text-sm text-muted-foreground">Lớp hành chính</span>
                <span className="text-sm font-semibold text-foreground">CNTT K23A</span>
              </div>
              <div className="flex items-center justify-between rounded-[1.25rem] border border-border/70 bg-background/75 px-4 py-3">
                <span className="text-sm text-muted-foreground">Cố vấn học tập</span>
                <span className="text-sm font-semibold text-foreground">ThS. Trần Minh Quân</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <Button variant="ghost" className="w-fit self-start">
        Đi tới chi tiết học tập
        <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  )
}
