import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionCard } from '@/components/dashboard/SectionCard'

type QuickActionItem = {
  title: string
  description: string
  icon: LucideIcon
}

type QuickActionsProps = {
  title: string
  description: string
  actions: QuickActionItem[]
}

export function QuickActions({ title, description, actions }: QuickActionsProps) {
  return (
    <SectionCard title={title} description={description}>
      <div className="grid gap-3 md:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <div
              key={action.title}
              className="group flex rounded-[1.5rem] border border-border/70 bg-background/80 p-4 text-left transition-colors hover:bg-accent/70"
            >
              <div className="flex w-full items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <p className="font-medium text-foreground">{action.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{action.description}</p>
                </div>
                <Button type="button" variant="ghost" size="icon-sm" className="mt-1">
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
