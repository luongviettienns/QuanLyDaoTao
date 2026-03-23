import { useCallback } from 'react'
import { AdminDataPage } from './AdminDataPage'
import { getCourseOfferings, type CourseOfferingItem } from './admin-api'

export function CourseSectionsPage() {
  const load = useCallback(() => getCourseOfferings(), [])

  return (
    <AdminDataPage<CourseOfferingItem>
      eyebrow="Tổ chức giảng dạy"
      title="Lớp học phần"
      description="Theo dõi lớp học phần theo môn học, giảng viên phụ trách, học kỳ và sức chứa hiện tại."
      meta="Kết nối API /course-offerings"
      load={load}
      getKey={(item) => item.id}
      emptyTitle="Chưa có lớp học phần"
      emptyDescription="Hệ thống hiện chưa có lớp học phần đang hoạt động hoặc chưa tải được dữ liệu."
      columns={[
        { key: 'code', header: 'Mã lớp', render: (item) => item.classCode },
        { key: 'subject', header: 'Môn học', render: (item) => `${item.subject.subjectCode} · ${item.subject.subjectName}` },
        { key: 'lecturer', header: 'Giảng viên', render: (item) => item.lecturer?.fullName ?? 'Chưa phân công' },
        { key: 'semester', header: 'Học kỳ', render: (item) => item.semesterLabel ?? 'Chưa gán' },
      ]}
    />
  )
}
