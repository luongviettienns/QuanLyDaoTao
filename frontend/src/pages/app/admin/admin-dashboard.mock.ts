import {
  BellRing,
  BookOpenCheck,
  CalendarClock,
  ClipboardCheck,
  GraduationCap,
  ShieldAlert,
  Users,
  Waypoints,
} from 'lucide-react'

export const adminStats = [
  {
    label: 'Sinh viên đang hoạt động',
    value: '3.482',
    note: 'Đang có lịch học hoặc hồ sơ học vụ trong học kỳ hiện tại.',
    icon: Users,
    status: { tone: 'normal' as const, text: 'Ổn định' },
  },
  {
    label: 'Lớp đang mở',
    value: '128',
    note: 'Bao gồm lớp đại cương, chuyên ngành và học phần thực hành.',
    icon: GraduationCap,
    status: { tone: 'today' as const, text: 'Học kỳ 2' },
  },
  {
    label: 'Buổi học hôm nay',
    value: '64',
    note: 'Các ca học cần theo dõi điểm danh và trạng thái giảng dạy trong ngày.',
    icon: CalendarClock,
    status: { tone: 'today' as const, text: 'Hôm nay' },
  },
  {
    label: 'Cảnh báo học vụ',
    value: '27',
    note: 'Sinh viên hoặc lớp đang chạm ngưỡng cần nhà trường theo dõi thêm.',
    icon: ShieldAlert,
    status: { tone: 'critical' as const, text: 'Ưu tiên cao' },
  },
]

export const adminQuickActions = [
  {
    title: 'Rà soát lớp chưa chốt điểm danh',
    description: 'Kiểm tra các buổi học trong ngày chưa có trạng thái điểm danh hoàn tất.',
    icon: ClipboardCheck,
  },
  {
    title: 'Theo dõi sinh viên vượt ngưỡng vắng',
    description: 'Mở danh sách sinh viên có số buổi vắng cần nhắc việc hoặc xử lý học vụ.',
    icon: ShieldAlert,
  },
  {
    title: 'Kiểm tra lịch học thay đổi',
    description: 'Xác nhận các lớp đổi phòng, đổi ca hoặc tạm hoãn trong 24 giờ gần nhất.',
    icon: CalendarClock,
  },
  {
    title: 'Xem thông báo hệ thống',
    description: 'Rà soát thông báo gửi tới các khoa, bộ môn và tài khoản quản trị.',
    icon: BellRing,
  },
]

export const adminAlerts = [
  {
    title: '12 lớp chưa chốt điểm danh trong ngày',
    description: 'Các lớp này đã qua thời điểm kết thúc ca học nhưng chưa ghi nhận trạng thái chốt dữ liệu.',
    meta: 'Cần xử lý ngay',
    tone: 'critical' as const,
    icon: ClipboardCheck,
  },
  {
    title: '7 sinh viên vượt ngưỡng vắng 20%',
    description: 'Cần gửi cảnh báo cho cố vấn học tập và kiểm tra lịch sử điểm danh của từng học phần.',
    meta: 'Cảnh báo học vụ',
    tone: 'attention' as const,
    icon: ShieldAlert,
  },
  {
    title: '3 lớp có thay đổi phòng học',
    description: 'Lịch học cần được đồng bộ lại trên hệ thống trước ca chiều để tránh sai thông tin.',
    meta: 'Trong hôm nay',
    tone: 'today' as const,
    icon: Waypoints,
  },
]

export const adminSchedules = [
  {
    title: 'Ca học 07:30 - 09:30 · Khối đại cương',
    subtitle: '18 lớp đang diễn ra, 4 lớp chưa ghi nhận điểm danh đủ số lượng sinh viên.',
    time: '07:30 - 09:30',
    tone: 'today' as const,
    statusText: 'Đang theo dõi',
    icon: CalendarClock,
  },
  {
    title: 'Rà soát dữ liệu cảnh báo học vụ',
    subtitle: 'Đối chiếu số buổi vắng và danh sách sinh viên cần liên hệ trong buổi sáng.',
    time: '10:00',
    tone: 'attention' as const,
    statusText: 'Đến hạn',
    icon: ShieldAlert,
  },
  {
    title: 'Chốt báo cáo điểm danh trong ngày',
    subtitle: 'Tổng hợp các buổi học và xác nhận dữ liệu chốt trước 17:30.',
    time: '17:30',
    tone: 'critical' as const,
    statusText: 'Hạn cuối',
    icon: BookOpenCheck,
  },
]

export const adminAnnouncements = [
  {
    title: 'Đợt rà soát dữ liệu chuyên cần tuần 8',
    description: 'Phòng đào tạo yêu cầu các đơn vị kiểm tra lớp có tỷ lệ vắng tăng bất thường trước 16:00 thứ Sáu.',
    meta: 'Thông báo nội bộ',
    tone: 'normal' as const,
    icon: BellRing,
  },
  {
    title: 'Bổ sung cấu hình phòng học mới',
    description: 'Danh sách phòng thực hành khối CNTT đã được cập nhật, cần đối chiếu lịch học từ tuần sau.',
    meta: 'Cập nhật hệ thống',
    tone: 'today' as const,
    icon: Waypoints,
  },
]
