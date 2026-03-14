import React from 'react'

const ICONS = {
  chart: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 19h16v2H2V3h2v16Zm3-2H5v-6h2v6Zm6 0h-2V7h2v10Zm6 0h-2V4h2v13Z" />
    </svg>
  ),
  schedule: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm11 8H6v10h12V10ZM8 12h3v3H8v-3Zm5 0h3v3h-3v-3Z" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 11a4 4 0 1 0-3.999-4A4 4 0 0 0 16 11Zm-8 1a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm8 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4ZM8 14c-.4 0-.86.02-1.36.06C4.42 14.23 1 15.31 1 18v2h5v-2c0-1.55.83-2.88 2.17-3.87A8.98 8.98 0 0 0 8 14Z" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3Zm0 10.99h6c-.46 3.58-2.82 6.77-6 7.94v-7.93Zm0-8.91 6 2.25v4.66h-6V4.08Z" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z" />
    </svg>
  ),
  tasks: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9.55 18.7-4.9-4.9 1.4-1.4 3.5 3.5 8.4-8.4 1.4 1.4-9.8 9.8ZM4 6h12v2H4V6Z" />
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16v2H4V7Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 4a6 6 0 1 0 3.87 10.58l4.27 4.27 1.41-1.41-4.27-4.27A6 6 0 0 0 10 4Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
    </svg>
  ),
}

const ROLE_CONFIG = {
  admin: {
    label: 'Cán bộ đào tạo',
    accent: 'Theo dõi và điều phối học vụ theo từng đầu việc phát sinh',
    summaryTitle: 'Các đầu việc học vụ cần xử lý trong ngày',
    taskEyebrow: 'Điều hành đào tạo',
    taskTitle: 'Danh sách việc cần ưu tiên',
    menu: [
      { key: 'overview', label: 'Tổng quan', icon: 'chart' },
      { key: 'registration', label: 'Đăng ký học phần', icon: 'schedule' },
      { key: 'classes', label: 'Lớp học phần', icon: 'users' },
      { key: 'monitoring', label: 'Theo dõi học vụ', icon: 'shield' },
    ],
    spotlight: {
      icon: 'shield',
      eyebrow: 'Điểm nóng học vụ',
      title: '06 hồ sơ cần chốt trước buổi chiều',
      description: 'Ưu tiên hồ sơ mở lớp và điều chỉnh sĩ số để không làm gián đoạn đợt đăng ký hiện tại.',
      meta: 'Cập nhật 09:15 · Từ phòng đào tạo',
    },
    stats: [
      { label: 'Yêu cầu học vụ chờ xử lý', value: '18', delta: '06 hồ sơ cần xử lý ngay', tone: 'warn' },
      { label: 'Lớp học phần cần rà soát', value: '12', delta: 'Có lớp thiếu sĩ số và vượt sĩ số', tone: 'neutral' },
      { label: 'Đợt đăng ký hiện tại', value: 'Đang mở', delta: 'Kết thúc lúc 17:00 hôm nay', tone: 'good' },
    ],
    tasks: [
      {
        title: 'Duyệt yêu cầu mở thêm lớp học phần',
        description: 'Các đề nghị mới từ khoa CNTT và Kinh tế số cần được chốt sớm để kịp xếp lịch bổ sung trong đợt đăng ký đang mở.',
        priority: 'Cao',
        priorityTone: 'warn',
        status: 'Chờ phê duyệt',
        statusTone: 'warn',
        due: 'Trước 15:00',
        scope: '02 khoa',
        count: '05 hồ sơ',
        actionLabel: 'Mở danh sách hồ sơ',
      },
      {
        title: 'Rà soát lớp học phần vượt sĩ số',
        description: 'Kiểm tra các lớp đang vượt ngưỡng để quyết định tách lớp, mở thêm chỗ hoặc điều phối sang lớp song song.',
        priority: 'Cao',
        priorityTone: 'warn',
        status: 'Cần điều phối',
        statusTone: 'neutral',
        due: 'Trong hôm nay',
        scope: 'Học kỳ 2',
        count: '03 lớp',
        actionLabel: 'Xem các lớp bị ảnh hưởng',
      },
      {
        title: 'Theo dõi tiến độ nhập điểm giữa kỳ',
        description: 'Hai khoa vẫn còn lớp chưa cập nhật đầu điểm đúng hạn, cần nhắc giảng viên trước khi khóa hệ thống tổng hợp.',
        priority: 'Trung bình',
        priorityTone: 'neutral',
        status: 'Đang theo dõi',
        statusTone: 'good',
        due: '17:00 thứ Sáu',
        scope: '02 khoa',
        count: '11 lớp',
        actionLabel: 'Theo dõi tiến độ nhập điểm',
      },
    ],
  },
  lecturer: {
    label: 'Giảng viên',
    accent: 'Lịch dạy và các đầu việc lớp học phần trong ngày',
    summaryTitle: 'Những việc giảng dạy cần hoàn tất hôm nay',
    taskEyebrow: 'Lớp phụ trách',
    taskTitle: 'Việc cần xử lý ưu tiên',
    menu: [
      { key: 'overview', label: 'Tổng quan', icon: 'chart' },
      { key: 'teaching-schedule', label: 'Lịch giảng dạy', icon: 'schedule' },
      { key: 'class-sections', label: 'Lớp học phần', icon: 'users' },
      { key: 'notifications', label: 'Thông báo học vụ', icon: 'bell' },
    ],
    spotlight: {
      icon: 'schedule',
      eyebrow: 'Nhắc việc lớp phụ trách',
      title: '02 lớp chưa chốt điểm danh',
      description: 'Hoàn tất điểm danh và cập nhật đầu điểm để dữ liệu đồng bộ đúng cho sinh viên trong ngày.',
      meta: 'Cập nhật 08:40 · Theo lịch dạy hôm nay',
    },
    stats: [
      { label: 'Buổi dạy tiếp theo', value: '09:30', delta: 'SE330 - Phòng B2.203', tone: 'good' },
      { label: 'Lớp chưa điểm danh', value: '02', delta: 'Cần cập nhật trước cuối ngày', tone: 'warn' },
      { label: 'Đầu điểm chưa hoàn tất', value: '11', delta: 'Liên quan 3 lớp học phần', tone: 'neutral' },
    ],
    tasks: [
      {
        title: 'Chốt điểm danh lớp SE330 buổi sáng nay',
        description: 'Danh sách vắng - muộn của buổi học sáng chưa được xác nhận, cần hoàn tất để tránh sinh viên phản hồi sai dữ liệu.',
        priority: 'Cao',
        priorityTone: 'warn',
        status: 'Cần cập nhật',
        statusTone: 'warn',
        due: 'Trước 12:00',
        scope: 'SE330',
        count: '47 sinh viên',
        actionLabel: 'Mở bảng điểm danh',
      },
      {
        title: 'Nhập điểm bài tập lớn lớp SE346',
        description: 'Đợt chấm đã xong nhưng đầu điểm trên hệ thống còn thiếu, cần nhập đủ để khóa điểm đúng hạn cho lớp học phần.',
        priority: 'Cao',
        priorityTone: 'warn',
        status: 'Sắp đến hạn',
        statusTone: 'neutral',
        due: 'Ngày mai',
        scope: 'SE346',
        count: '03 nhóm chưa nhập',
        actionLabel: 'Mở đầu điểm lớp',
      },
      {
        title: 'Đăng tài liệu tuần 7 cho môn Cơ sở dữ liệu',
        description: 'Sinh viên đã nhắc nhiều lần về tài liệu hướng dẫn thực hành, nên ưu tiên cập nhật trước buổi học kế tiếp.',
        priority: 'Trung bình',
        priorityTone: 'neutral',
        status: 'Đang chờ cập nhật',
        statusTone: 'good',
        due: 'Trước buổi học kế tiếp',
        scope: 'Môn CSDL',
        count: '12 lượt nhắc',
        actionLabel: 'Đăng tài liệu ngay',
      },
    ],
  },
  student: {
    label: 'Sinh viên',
    accent: 'Lịch học và tiến độ học tập cá nhân theo từng mốc việc',
    summaryTitle: 'Các mốc học tập bạn cần chú ý',
    taskEyebrow: 'Cá nhân hôm nay',
    taskTitle: 'Việc cần hoàn tất sớm',
    menu: [
      { key: 'overview', label: 'Tổng quan', icon: 'chart' },
      { key: 'schedule', label: 'Lịch học của tôi', icon: 'schedule' },
      { key: 'registration', label: 'Đăng ký học phần', icon: 'tasks' },
      { key: 'notifications', label: 'Thông báo liên quan', icon: 'bell' },
    ],
    spotlight: {
      icon: 'tasks',
      eyebrow: 'Mốc cần chú ý',
      title: 'Cổng đăng ký tự chọn đóng lúc 17:00',
      description: 'Kiểm tra lại lịch học và số tín chỉ để tránh trùng ca hoặc thiếu học phần trong kế hoạch cá nhân.',
      meta: 'Cập nhật 10:05 · Theo dữ liệu cá nhân',
    },
    stats: [
      { label: 'Buổi học tiếp theo', value: '13:00', delta: 'Phân tích thiết kế HTTT - A1.205', tone: 'good' },
      { label: 'Hạn nộp gần nhất', value: '2 ngày', delta: 'Báo cáo môn Phân tích hệ thống', tone: 'warn' },
      { label: 'Tín chỉ đã đăng ký', value: '18', delta: 'Đạt đúng kế hoạch học kỳ', tone: 'neutral' },
    ],
    tasks: [
      {
        title: 'Hoàn tất đăng ký học phần tự chọn',
        description: 'Bạn vẫn còn thiếu xác nhận cuối cho nhóm học phần tự chọn, cần kiểm tra lại để không bị khóa đăng ký sau 17:00.',
        priority: 'Cao',
        priorityTone: 'warn',
        status: 'Cần xác nhận',
        statusTone: 'warn',
        due: '17:00 hôm nay',
        scope: 'Kế hoạch học kỳ',
        count: '02 học phần',
        actionLabel: 'Kiểm tra đăng ký',
      },
      {
        title: 'Kiểm tra cập nhật lịch thi cuối kỳ',
        description: 'Môn Hệ quản trị cơ sở dữ liệu vừa đổi phòng thi, bạn nên xem lại ngay để tránh nhầm lịch vào ngày thi chính thức.',
        priority: 'Trung bình',
        priorityTone: 'neutral',
        status: 'Có thay đổi mới',
        statusTone: 'good',
        due: 'Trong hôm nay',
        scope: 'HK2 năm 2025-2026',
        count: '01 môn đổi phòng',
        actionLabel: 'Xem lịch thi cập nhật',
      },
      {
        title: 'Nộp báo cáo môn Phân tích hệ thống',
        description: 'Nhóm của bạn còn thiếu file minh chứng và biên bản phân công, cần hoàn chỉnh trước khi gửi bản cuối trên hệ thống.',
        priority: 'Cao',
        priorityTone: 'warn',
        status: 'Sắp đến hạn',
        statusTone: 'neutral',
        due: 'Sau 2 ngày',
        scope: 'Nhóm 04',
        count: '02 file còn thiếu',
        actionLabel: 'Hoàn tất hồ sơ nộp bài',
      },
    ],
  },
}

export { ICONS, ROLE_CONFIG }
