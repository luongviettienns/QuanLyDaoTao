import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'

type DashboardHeaderProps = {
  eyebrow: string
  title: string
  description: string
  meta?: string
  action?: ReactNode
}

export function DashboardHeader({ eyebrow, title, description, meta, action }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl tracking-tight text-foreground sm:text-4xl">{title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
        </div>
        {meta ? <Badge variant="secondary">{meta}</Badge> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  )
}
