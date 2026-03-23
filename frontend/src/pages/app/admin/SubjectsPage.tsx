import { useCallback } from 'react'
import { AdminDataPage } from './AdminDataPage'
import { getSubjects, type SubjectItem } from './admin-api'

export function SubjectsPage() {
  const load = useCallback(() => getSubjects(), [])

  return (
    <AdminDataPage<SubjectItem>
      eyebrow="Danh mục đào tạo"
      title="Môn học"
      description="Quản lý danh sách môn học đang dùng trong hệ thống, gồm mã môn, số tín chỉ và bộ môn phụ trách."
      meta="Kết nối API /subjects"
      load={load}
      getKey={(item) => item.id}
      emptyTitle="Chưa có môn học"
      emptyDescription="Danh mục môn học chưa có dữ liệu hoặc chưa được đồng bộ từ backend."
      columns={[
        { key: 'code', header: 'Mã môn', render: (item) => item.subjectCode },
        { key: 'name', header: 'Tên môn học', render: (item) => item.subjectName },
        { key: 'credits', header: 'Tín chỉ', render: (item) => item.credits },
        { key: 'department', header: 'Bộ môn', render: (item) => `${item.department.code} · ${item.department.name}` },
      ]}
    />
  )
}
