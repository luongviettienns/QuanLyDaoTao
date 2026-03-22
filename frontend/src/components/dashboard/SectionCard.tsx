import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type SectionCardProps = {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}

export function SectionCard({ title, description, action, children }: SectionCardProps) {
  return (
    <Card className="rounded-[1.75rem] border border-border/80 bg-card/95 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="font-sans text-lg font-semibold text-foreground">{title}</CardTitle>
            {description ? <CardDescription className="max-w-2xl text-sm leading-6">{description}</CardDescription> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
