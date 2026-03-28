import { ChevronDown, HelpCircle, LogOut, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type DashboardTopBarProps = {
  title: string
  fullName: string
  username: string
  email: string
  roleName: string
  onLogout: () => void
}

export function DashboardTopBar({ title, fullName, username, email, roleName, onLogout }: DashboardTopBarProps) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  const initials =
    (parts[0]?.[0] ?? '').toUpperCase() + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '').toUpperCase() : '')

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 shrink-0 text-primary" />
            <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">{title}</h1>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">Hệ thống Quản lý đào tạo</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => toast.info('Liên hệ hỗ trợ kỹ thuật: 028 3888 1020 (08:00 - 17:00).')}
          >
            <HelpCircle className="size-4" />
            Hỗ trợ
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full max-w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-left shadow-sm transition-colors hover:bg-muted/60 focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-auto sm:min-w-[280px]"
              >
                <Avatar className="shrink-0" size="lg">
                  <AvatarFallback className="text-sm font-medium">{initials || username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="block truncate text-sm font-semibold leading-tight text-foreground">{fullName}</span>
                  <span className="block truncate text-xs text-muted-foreground">{email}</span>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary" className="text-xs font-normal">
                      {roleName}
                    </Badge>
                    <span className="truncate text-xs text-muted-foreground">@{username}</span>
                  </div>
                </div>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-11">
                      <AvatarFallback className="text-base font-medium">{initials || username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{fullName}</p>
                      <p className="truncate text-sm text-muted-foreground">{email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 rounded-lg bg-muted/50 px-2.5 py-2 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Tài khoản</span>
                      <span className="truncate font-medium text-foreground">{username}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Vai trò</span>
                      <span className="truncate font-medium text-foreground">{roleName}</span>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => toast.info('Liên hệ hỗ trợ kỹ thuật: 028 3888 1020 (08:00 - 17:00).')}>
                <HelpCircle className="size-4" />
                Hỗ trợ kỹ thuật
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={(event) => {
                  event.preventDefault()
                  onLogout()
                }}
              >
                <LogOut className="size-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

