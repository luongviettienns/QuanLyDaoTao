import { useCallback } from 'react'
import { AdminDataPage } from './AdminDataPage'
import { getRegistrationPeriods, type RegistrationPeriodItem } from './admin-api'

export function RegistrationPeriodsPage() {
  const load = useCallback(() => getRegistrationPeriods(), [])

  return (
    <AdminDataPage<RegistrationPeriodItem>
      eyebrow="Đăng ký học phần"
      title="Đợt đăng ký"
      description="Theo dõi trạng thái các đợt đăng ký học phần, học kỳ áp dụng và mốc thời gian mở/đóng."
      meta="Kết nối API /registration-periods"
      load={load}
      getKey={(item) => item.id}
      emptyTitle="Chưa có đợt đăng ký"
      emptyDescription="Hiện chưa có đợt đăng ký nào trong hệ thống hoặc dữ liệu chưa được tải."
      columns={[
        { key: 'name', header: 'Đợt đăng ký', render: (item) => item.periodName },
        { key: 'semester', header: 'Học kỳ', render: (item) => item.semesterLabel },
        { key: 'status', header: 'Trạng thái', render: (item) => item.status },
        { key: 'periodType', header: 'Loại đợt', render: (item) => item.periodType },
      ]}
    />
  )
}
