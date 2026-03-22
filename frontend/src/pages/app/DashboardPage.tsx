import { Link } from 'react-router-dom'
import { useAuth } from '@/app/auth/auth-context'
import { defaultRoleRoute, roleLabels } from '@/app/auth/roles'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Compass } from 'lucide-react'

export function DashboardPage() {
  const { role } = useAuth()
  const primaryRoute = role ? defaultRoleRoute[role] : '/login'

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="w-full max-w-3xl">
        <EmptyState
          icon={Compass}
          title="Chọn đúng khu vực làm việc"
          description={role ? `Phiên hiện tại đang ở vai trò ${roleLabels[role]}. Chọn khu vực chính để tiếp tục làm việc đúng phạm vi quyền.` : 'Chưa có phiên giả lập để điều hướng tới khu vực tương ứng.'}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to={primaryRoute}>Đi tới khu vực chính</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/login">Quay lại đăng nhập</Link>
              </Button>
            </div>
          }
        />
      </div>
    </div>
  )
}
