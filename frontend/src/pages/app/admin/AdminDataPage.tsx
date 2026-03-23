import { useEffect, useState } from 'react'
import { AlertTriangle, FolderKanban } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { SectionCard } from '@/components/dashboard/SectionCard'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type DataPageColumn<T> = {
  key: string
  header: string
  render: (item: T) => React.ReactNode
}

type DataPageProps<T> = {
  eyebrow: string
  title: string
  description: string
  meta?: string
  load: () => Promise<{ items: T[] }>
  columns: DataPageColumn<T>[]
  getKey: (item: T) => string
  emptyTitle: string
  emptyDescription: string
}

export function AdminDataPage<T>({
  eyebrow,
  title,
  description,
  meta,
  load,
  columns,
  getKey,
  emptyTitle,
  emptyDescription,
}: DataPageProps<T>) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function run() {
      try {
        setLoading(true)
        setError(null)
        const result = await load()
        if (mounted) {
          setItems(result.items)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void run()

    return () => {
      mounted = false
    }
  }, [load])

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader eyebrow={eyebrow} title={title} description={description} meta={meta} />

      <SectionCard title="Dữ liệu hiện có" description="Danh sách được tải trực tiếp từ backend theo vai trò admin.">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-[1.25rem]" />
            ))}
          </div>
        ) : error ? (
          <Empty className="rounded-[1.5rem] border border-border/70 bg-background/60">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertTriangle />
              </EmptyMedia>
              <EmptyTitle>Không thể tải dữ liệu</EmptyTitle>
              <EmptyDescription>{error}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : items.length === 0 ? (
          <Empty className="rounded-[1.5rem] border border-border/70 bg-background/60">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderKanban />
              </EmptyMedia>
              <EmptyTitle>{emptyTitle}</EmptyTitle>
              <EmptyDescription>{emptyDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-background/80">
            <div className="grid border-b border-border/70 bg-accent/40 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
              {columns.map((column) => (
                <div key={column.key}>{column.header}</div>
              ))}
            </div>
            <div className="flex flex-col">
              {items.map((item, index) => (
                <div
                  key={getKey(item)}
                  className={cn(
                    'grid gap-3 px-4 py-4 text-sm text-foreground',
                    index !== items.length - 1 && 'border-b border-border/60',
                  )}
                  style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
                >
                  {columns.map((column) => (
                    <div key={column.key} className="min-w-0 break-words text-sm leading-6 text-foreground">
                      {column.render(item)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
