import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LecturerPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Lecturer area</p>
        <h1 className="mt-2 font-heading text-4xl text-slate-900">Khu vực giảng viên</h1>
      </div>

      <Card className="rounded-[1.75rem] border border-slate-200/80 bg-white/90">
        <CardHeader>
          <CardTitle>Phạm vi cho bước 1.5</CardTitle>
          <CardDescription>
            Trang này xác nhận route dành riêng cho giảng viên đã được tách đúng trước khi thiết kế giao diện điểm danh, nhập điểm và lớp phụ trách.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4">Điểm danh theo buổi</div>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4">Nhập và rà soát điểm</div>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4">Theo dõi lớp phụ trách</div>
        </CardContent>
      </Card>
    </div>
  )
}
