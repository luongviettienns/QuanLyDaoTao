import { AlertTriangle, CheckCircle2, Clock3, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type StatusTone = 'normal' | 'attention' | 'critical' | 'today' | 'done'

type StatusBadgeProps = {
  tone: StatusTone
  children: string
}

const toneConfig: Record<StatusTone, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Info }> = {
  normal: { variant: 'secondary', icon: Info },
  attention: { variant: 'outline', icon: AlertTriangle },
  critical: { variant: 'destructive', icon: AlertTriangle },
  today: { variant: 'default', icon: Clock3 },
  done: { variant: 'secondary', icon: CheckCircle2 },
}

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  const { variant, icon: Icon } = toneConfig[tone]

  return (
    <Badge variant={variant}>
      <Icon data-icon="inline-start" />
      {children}
    </Badge>
  )
}
