import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl rounded-[1.75rem] border border-slate-200/80 bg-white/90">
        <CardHeader>
          <CardTitle>Không tìm thấy trang</CardTitle>
          <CardDescription>
            Đường dẫn này không tồn tại trong kiến trúc điều hướng hiện tại của hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button asChild className="h-11 rounded-2xl bg-slate-950 text-white">
            <Link to="/">Về trang chủ</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-2xl">
            <Link to="/app/dashboard">Mở app shell</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
