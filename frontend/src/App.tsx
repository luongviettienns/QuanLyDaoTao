import { AppProviders } from "@/app/providers"
import { appConfig } from "@/config/env"
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  BookOpen,
  ChartNoAxesColumn,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

const trustHighlights = [
  {
    icon: ShieldCheck,
    title: "Phân quyền hệ thống",
    description: "Quản lý truy cập theo vai trò: Admin, Giảng viên, Cố vấn, Sinh viên.",
  },
  {
    icon: ChartNoAxesColumn,
    title: "Theo dõi học vụ",
    description: "Quản lý điểm danh, điểm số và tiến độ học tập theo thời gian thực.",
  },
  {
    icon: BellRing,
    title: "Thông báo tự động",
    description: "Cảnh báo vắng học, nhắc lịch và cập nhật học vụ kịp thời.",
  },
] as const

const roleBadges = ["Admin", "Giảng viên", "Cố vấn", "Sinh viên"] as const

function App() {
  return (
    <AppProviders>
      <main className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_66%)]" />
        <div className="pointer-events-none absolute left-[-8rem] top-24 size-72 rounded-full bg-[radial-gradient(circle,rgba(255,214,153,0.6),transparent_68%)] blur-3xl" />
        <div className="pointer-events-none absolute right-[-7rem] top-10 size-80 rounded-full bg-[radial-gradient(circle,rgba(147,197,253,0.55),transparent_70%)] blur-3xl" />

        <section className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 xl:gap-14">

            {/* LEFT */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/68 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8 lg:p-10">

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-slate-600 shadow-sm">
                  <Sparkles className="size-3.5 text-amber-500" />
                  Hệ thống đào tạo
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-1.5 text-xs font-medium text-blue-700">
                  <BadgeCheck className="size-3.5" />
                  Sẵn sàng vận hành
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-500">
                  {appConfig.appName}
                </p>

                <div className="max-w-2xl space-y-4">
                  <h1 className="font-heading text-5xl leading-[0.95] tracking-tight text-slate-900 sm:text-6xl xl:text-7xl">
                    Hệ thống quản lý đào tạo tập trung và chính xác.
                  </h1>

                  <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                    Quản lý lớp học, điểm danh, điểm số và tiến độ học tập trong một nền tảng thống nhất, rõ ràng và dễ sử dụng.
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
                    <article
                      key={item.title}
                      className="group rounded-[1.5rem] border border-slate-200/70 bg-white/88 p-4"
                    >
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
                      Học vụ rõ ràng
                    </div>

                    <p className="max-w-lg text-sm text-slate-700 sm:text-base">
                      Quy trình học vụ được tổ chức từ đăng ký học phần đến quản lý điểm và xử lý phúc khảo.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-white">
                    <GraduationCap className="size-5 text-amber-300" />
                    <div>
                      <p className="text-xs uppercase text-slate-300">Academic Suite</p>
                      <p className="text-sm font-medium">Designed for academic management</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* RIGHT - LOGIN */}
            <div className="relative">
              <Card className="rounded-[2rem] border border-white/70 bg-white/82 py-0">

                <CardHeader className="space-y-4 px-7 pt-8 pb-0 sm:px-8">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                    Secure Sign In
                  </div>

                  <div className="space-y-2">
                    <CardTitle className="font-heading text-4xl text-slate-900">
                      Chào mừng trở lại
                    </CardTitle>

                    <CardDescription className="text-sm text-slate-600">
                      Đăng nhập để truy cập hệ thống quản lý đào tạo theo quyền của bạn.
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="px-7 pt-8 pb-7 sm:px-8">
                  <form className="space-y-5">

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Email hoặc mã tài khoản
                      </label>
                      <Input
                        type="text"
                        placeholder="vd: gv001 hoặc giangvien@truong.edu.vn"
                        className="h-12 rounded-2xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Mật khẩu
                      </label>
                      <Input
                        type="password"
                        placeholder="Nhập mật khẩu"
                        className="h-12 rounded-2xl"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <Checkbox />
                        Ghi nhớ đăng nhập
                      </label>

                      <button className="text-sm text-blue-700">
                        Quên mật khẩu?
                      </button>
                    </div>

                    <Button className="h-12 w-full rounded-2xl bg-slate-950 text-white">
                      Truy cập hệ thống
                      <ArrowRight className="size-4" />
                    </Button>
                  </form>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">

                    <div className="rounded-xl border p-4">
                      <p className="text-xs text-slate-400">Attendance</p>
                      <p className="mt-2 font-semibold">Điểm danh theo buổi</p>
                      <p className="text-sm text-slate-600">Ghi nhận nhanh, rõ trạng thái.</p>
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-xs text-slate-400">Grading</p>
                      <p className="mt-2 font-semibold">Quản lý điểm</p>
                      <p className="text-sm text-slate-600">Theo dõi và cập nhật có kiểm soát.</p>
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-xs text-slate-400">Alerts</p>
                      <p className="mt-2 font-semibold">Cảnh báo học vụ</p>
                      <p className="text-sm text-slate-600">Phát hiện và thông báo kịp thời.</p>
                    </div>

                  </div>

                </CardContent>
              </Card>
            </div>

          </div>
        </section>
      </main>
    </AppProviders>
  )
}

export default App
