import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ForbiddenPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-xl rounded-[1.75rem] border border-slate-200/80 bg-white/90">
        <CardHeader>
          <CardTitle>Không có quyền truy cập</CardTitle>
          <CardDescription>
            Route này không thuộc phạm vi của vai trò hiện tại. Hãy quay lại khu vực đúng quyền của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button asChild className="h-11 rounded-2xl bg-slate-950 text-white">
            <Link to="/app/dashboard">Về tổng quan</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-2xl">
            <Link to="/login">Đổi vai trò</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
