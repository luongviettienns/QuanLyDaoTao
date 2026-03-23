import { useCallback } from 'react'
import { AdminDataPage } from './AdminDataPage'
import { getAdministrativeClasses, type AdministrativeClassItem } from './admin-api'

export function HomeroomClassesPage() {
  const load = useCallback(() => getAdministrativeClasses(), [])

  return (
    <AdminDataPage<AdministrativeClassItem>
      eyebrow="Danh mục đào tạo"
      title="Lớp hành chính"
      description="Theo dõi lớp hành chính theo khoá, ngành, cố vấn và quy mô sinh viên hiện tại."
      meta="Kết nối API /administrative-classes"
      load={load}
      getKey={(item) => item.id}
      emptyTitle="Chưa có lớp hành chính"
      emptyDescription="Hệ thống chưa có lớp hành chính hoặc chưa tải được dữ liệu tương ứng."
      columns={[
        { key: 'code', header: 'Mã lớp', render: (item) => item.classCode },
        { key: 'name', header: 'Tên lớp', render: (item) => item.className },
        { key: 'major', header: 'Ngành', render: (item) => `${item.major.code} · ${item.major.name}` },
        { key: 'advisor', header: 'Cố vấn', render: (item) => item.advisor?.fullName ?? 'Chưa phân công' },
      ]}
    />
  )
}
