import { BadgeCheck, BellRing, BookOpen, ChartNoAxesColumn, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { appConfig } from '@/config/env'
import { Button } from '@/components/ui/button'

const trustHighlights = [
  {
    icon: ShieldCheck,
    title: 'Phân quyền hệ thống',
    description: 'Tách khu vực điều hướng cho admin, giảng viên và sinh viên ngay từ tầng routing.',
  },
  {
    icon: ChartNoAxesColumn,
    title: 'Theo dõi học vụ',
    description: 'Kiến trúc route sẵn sàng để nối dashboard và module nghiệp vụ ở bước tiếp theo.',
  },
  {
    icon: BellRing,
    title: 'Thông báo rõ ràng',
    description: 'Luồng public và private được phân tách để điều hướng người dùng nhất quán hơn.',
  },
] as const

const roleBadges = ['Admin', 'Giảng viên', 'Sinh viên'] as const

export function LandingPage() {
  return (
    <section className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 xl:gap-14">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/68 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-slate-600 shadow-sm">
              <Sparkles className="size-3.5 text-amber-500" />
              Hệ thống đào tạo
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-1.5 text-xs font-medium text-blue-700">
              <BadgeCheck className="size-3.5" />
              Điều hướng đã được chuẩn hóa
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-500">{appConfig.appName}</p>
            <div className="max-w-2xl space-y-4">
              <h1 className="font-heading text-5xl leading-[0.95] tracking-tight text-slate-900 sm:text-6xl xl:text-7xl">
                Hệ thống quản lý đào tạo tập trung và chính xác.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Tách khu public và khu sau đăng nhập để sẵn sàng triển khai dashboard và auth flow thật ở Sprint tiếp theo.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {roleBadges.map((role) => (
              <span
                key={role}
                className="rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700"
              >
                {role}
              </span>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {trustHighlights.map((item) => {
              const Icon = item.icon

              return (
                <article key={item.title} className="rounded-[1.5rem] border border-slate-200/70 bg-white/88 p-4">
                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">{item.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                </article>
              )
            })}
          </div>

          <div className="mt-10 rounded-[1.75rem] border border-amber-200/80 bg-amber-50 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                  <BookOpen className="size-3.5" />
                  Cấu trúc điều hướng rõ ràng
                </div>
                <p className="max-w-lg text-sm text-slate-700 sm:text-base">
                  Public page, login page và app shell đã được tách để thuận lợi cho việc phát triển giao diện sau đăng nhập.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-white">
                <GraduationCap className="size-5 text-amber-300" />
                <div>
                  <p className="text-xs uppercase text-slate-300">Academic routing</p>
                  <p className="text-sm font-medium">Sẵn sàng cho Sprint 2</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/82 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
            Role-based routing
          </div>
          <h2 className="mt-6 font-heading text-4xl text-slate-900">Bắt đầu từ khu đăng nhập</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Ở bước này hệ thống dùng fake role để kiểm tra kiến trúc route. Dashboard chi tiết cho từng vai trò sẽ được thiết kế ở bước sau.
          </p>
          <div className="mt-8 space-y-3">
            <Button asChild className="h-12 w-full rounded-2xl bg-slate-950 text-white">
              <Link to="/login">Đi tới màn đăng nhập</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 w-full rounded-2xl">
              <Link to="/app/dashboard">Xem app shell mẫu</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
