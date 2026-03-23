import { useCallback } from 'react'
import { AdminDataPage } from './AdminDataPage'
import { getMyEnrollments, type EnrollmentItem } from './admin-api'

export function CourseRegistrationsPage() {
  const load = useCallback(async () => {
    const result = await getMyEnrollments()
    return { items: result.items }
  }, [])

  return (
    <AdminDataPage<EnrollmentItem>
      eyebrow="Đăng ký học phần"
      title="Đăng ký học phần"
      description="Màn này hiện đang hiển thị dữ liệu đăng ký theo API đã có để kiểm tra cấu trúc tích hợp. Khi có API admin riêng, phần danh sách sẽ được đổi sang tra cứu toàn cục."
      meta="Tạm dùng API /me/enrollments"
      load={load}
      getKey={(item) => item.id}
      emptyTitle="Chưa có đăng ký học phần"
      emptyDescription="Hiện chưa có dữ liệu đăng ký để hiển thị hoặc backend chưa trả về enrollment phù hợp."
      columns={[
        { key: 'class', header: 'Lớp học phần', render: (item) => `${item.courseOffering.classCode} · ${item.courseOffering.className}` },
        { key: 'subject', header: 'Môn học', render: (item) => item.courseOffering.subject.subjectName },
        { key: 'status', header: 'Trạng thái', render: (item) => item.enrollmentStatus },
        { key: 'date', header: 'Ngày đăng ký', render: (item) => new Date(item.enrollmentDate).toLocaleString('vi-VN') },
      ]}
    />
  )
}
