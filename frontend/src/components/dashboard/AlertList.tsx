import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { SectionCard } from '@/components/dashboard/SectionCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'

type AlertItem = {
  title: string
  description: string
  meta: string
  tone: 'attention' | 'critical' | 'today' | 'normal' | 'done'
  icon?: LucideIcon
}

type AlertListProps = {
  title: string
  description: string
  items: AlertItem[]
}

export function AlertList({ title, description, items }: AlertListProps) {
  return (
    <SectionCard title={title} description={description}>
      {items.length === 0 ? (
        <Empty className="border bg-muted/35">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertTriangle />
            </EmptyMedia>
            <EmptyTitle>Không có cảnh báo mới</EmptyTitle>
            <EmptyDescription>Tất cả mục cần theo dõi hiện đang ở trạng thái ổn định.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const Icon = item.icon ?? AlertTriangle

            return (
              <article key={item.title} className="flex flex-col gap-3 rounded-[1.5rem] border border-border/70 bg-background/80 p-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <Icon />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{item.meta}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end lg:self-auto">
                  <StatusBadge tone={item.tone}>{item.meta}</StatusBadge>
                  <Button variant="ghost" size="icon-sm">
                    <ArrowRight />
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}
