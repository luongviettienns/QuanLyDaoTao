import type { LucideIcon } from 'lucide-react'
import { CalendarClock } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { SectionCard } from '@/components/dashboard/SectionCard'

type ScheduleItem = {
  title: string
  subtitle: string
  time: string
  tone: 'attention' | 'critical' | 'today' | 'normal' | 'done'
  statusText: string
  icon?: LucideIcon
}

type ScheduleListProps = {
  title: string
  description: string
  items: ScheduleItem[]
}

export function ScheduleList({ title, description, items }: ScheduleListProps) {
  return (
    <SectionCard title={title} description={description}>
      {items.length === 0 ? (
        <Empty className="border bg-muted/35">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarClock />
            </EmptyMedia>
            <EmptyTitle>Không có lịch trong thời điểm này</EmptyTitle>
            <EmptyDescription>Danh sách lịch sẽ hiển thị khi có buổi học hoặc mốc công việc mới.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col">
          {items.map((item, index) => {
            const Icon = item.icon ?? CalendarClock

            return (
              <div key={`${item.title}-${item.time}`}>
                <article className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                      <Icon />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm leading-6 text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <p className="text-sm font-medium text-foreground">{item.time}</p>
                    <StatusBadge tone={item.tone}>{item.statusText}</StatusBadge>
                  </div>
                </article>
                {index < items.length - 1 ? <Separator /> : null}
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}
