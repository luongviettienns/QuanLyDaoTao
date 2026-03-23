import { useEffect, useState } from 'react'
import { CalendarClock, Database, FolderKanban } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { SectionCard } from '@/components/dashboard/SectionCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { getAcademicYears, getCurrentRegistrationPeriod, getSchoolYears, getSemesterMetadata, type AcademicYearItem, type RegistrationPeriodItem, type SchoolYearItem, type SemesterMetadataItem } from './admin-api'

export function AcademicDataPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [academicYears, setAcademicYears] = useState<AcademicYearItem[]>([])
  const [schoolYears, setSchoolYears] = useState<SchoolYearItem[]>([])
  const [semesters, setSemesters] = useState<SemesterMetadataItem[]>([])
  const [currentPeriod, setCurrentPeriod] = useState<RegistrationPeriodItem | null>(null)

  useEffect(() => {
    let mounted = true

    async function run() {
      try {
        setLoading(true)
        setError(null)
        const [academicYearsData, schoolYearsData, semestersData, currentPeriodData] = await Promise.all([
          getAcademicYears(),
          getSchoolYears(),
          getSemesterMetadata(),
          getCurrentRegistrationPeriod(),
        ])

        if (!mounted) return

        setAcademicYears(academicYearsData.items)
        setSchoolYears(schoolYearsData.items)
        setSemesters(semestersData.items)
        setCurrentPeriod(currentPeriodData.registrationPeriod)
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu học vụ.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void run()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        eyebrow="Danh mục đào tạo"
        title="Dữ liệu học vụ nền"
        description="Tổng hợp niên khoá, năm học, metadata học kỳ và trạng thái đợt đăng ký hiện tại để phục vụ điều hành học vụ."
        meta="Kết nối API dữ liệu nền"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Niên khoá"
          value={String(academicYears.length)}
          note="Số niên khoá hiện đang active trong hệ thống."
          icon={Database}
        />
        <StatCard
          label="Năm học"
          value={String(schoolYears.length)}
          note="Số năm học vận hành hiện có trong dữ liệu backend."
          icon={CalendarClock}
        />
        <StatCard
          label="Metadata học kỳ"
          value={String(semesters.length)}
          note="Các giá trị học kỳ đang dùng thống nhất trên toàn hệ thống."
          icon={FolderKanban}
        />
        <StatCard
          label="Đợt đăng ký hiện tại"
          value={currentPeriod ? currentPeriod.status : 'Không có'}
          note={currentPeriod ? currentPeriod.periodName : 'Hiện chưa có đợt đăng ký nào đang mở.'}
          icon={CalendarClock}
        />
      </div>

      <SectionCard title="Tổng quan dữ liệu nền" description="Kiểm tra nhanh trạng thái dữ liệu học vụ đang được backend cung cấp cho frontend admin.">
        {loading ? (
          <div className="grid gap-3 md:grid-cols-2">
            <Skeleton className="h-40 rounded-[1.5rem]" />
            <Skeleton className="h-40 rounded-[1.5rem]" />
          </div>
        ) : error ? (
          <Empty className="rounded-[1.5rem] border border-border/70 bg-background/60">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderKanban />
              </EmptyMedia>
              <EmptyTitle>Không thể tải dữ liệu học vụ</EmptyTitle>
              <EmptyDescription>{error}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
              <p className="text-sm font-semibold text-foreground">Niên khoá active</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                {academicYears.length === 0 ? <span>Chưa có dữ liệu.</span> : academicYears.map((item) => <span key={item.id}>{item.yearName} · {item.cohortCode ?? 'Không có mã khóa'}</span>)}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-4">
              <p className="text-sm font-semibold text-foreground">Năm học và học kỳ hiện hành</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                {schoolYears.length === 0 ? (
                  <span>Chưa có dữ liệu năm học.</span>
                ) : (
                  schoolYears.map((item) => (
                    <span key={item.id}>
                      {item.yearName} · {item.currentSemesterLabel ?? 'Chưa xác định học kỳ hiện hành'}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
