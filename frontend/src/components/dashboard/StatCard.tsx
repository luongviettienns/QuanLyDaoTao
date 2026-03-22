import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/dashboard/StatusBadge'

type StatCardProps = {
  label: string
  value: string
  note: string
  icon: LucideIcon
  status?: {
    tone: 'normal' | 'attention' | 'critical' | 'today' | 'done'
    text: string
  }
}

export function StatCard({ label, value, note, icon: Icon, status }: StatCardProps) {
  return (
    <Card className="rounded-[1.75rem] border border-border/80 bg-card/95 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon />
          </div>
          {status ? <StatusBadge tone={status.tone}>{status.text}</StatusBadge> : null}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <CardTitle className="font-sans text-3xl font-semibold tracking-tight text-foreground">{value}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  )
}
