import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// Sequência de páginas a exibir: números + 'ellipsis' para gaps de 2+ páginas.
// siblingCount = quantas páginas mostrar de cada lado da atual.
export function getPageItems(
  page: number,
  totalPages: number,
  siblingCount = 1
): (number | 'ellipsis')[] {
  const anchors = new Set<number>()
  anchors.add(1)
  anchors.add(totalPages)
  for (let p = page - siblingCount; p <= page + siblingCount; p++) {
    if (p >= 1 && p <= totalPages) anchors.add(p)
  }

  const sorted = [...anchors].sort((a, b) => a - b)
  const items: (number | 'ellipsis')[] = []
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i]
    items.push(current)
    const next = sorted[i + 1]
    if (next === undefined) continue
    const diff = next - current
    if (diff === 2) {
      items.push(current + 1)
    } else if (diff > 2) {
      items.push('ellipsis')
    }
  }
  return items
}

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const { t } = useTranslation('dashboard')
  const [jumpValue, setJumpValue] = useState('')

  const items = getPageItems(page, totalPages)

  const handleJump = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = jumpValue.trim()
    if (trimmed === '') return
    const parsed = Number(trimmed)
    if (!Number.isFinite(parsed)) {
      setJumpValue('')
      return
    }
    const target = Math.min(Math.max(Math.trunc(parsed), 1), totalPages)
    onPageChange(target)
    setJumpValue('')
  }

  return (
    <nav
      aria-label={t('latestJobs.pagination')}
      className={cn('flex flex-wrap items-center justify-end gap-x-2 gap-y-2', className)}
    >
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          aria-label={t('latestJobs.previous')}
          className="text-muted-foreground"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{t('latestJobs.previous')}</span>
        </Button>

        <div className="hidden items-center gap-1 sm:flex">
          {items.map((item, i) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${i}`}
                aria-hidden="true"
                className="inline-flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                size="sm"
                variant="ghost"
                aria-label={t('latestJobs.pageLabel', { page: item })}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  'min-w-8',
                  item === page
                    ? 'bg-primary/10 text-primary hover:bg-primary/15'
                    : 'text-muted-foreground'
                )}
                onClick={() => onPageChange(item)}
              >
                {item}
              </Button>
            )
          )}
        </div>

        <span className="inline-flex items-center gap-1 px-1 text-sm text-muted-foreground sm:hidden">
          <span className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md bg-primary/10 px-2.5 font-medium text-primary">
            {page}
          </span>
          / {totalPages}
        </span>

        <Button
          size="sm"
          variant="ghost"
          aria-label={t('latestJobs.next')}
          className="text-muted-foreground"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <span className="hidden sm:inline">{t('latestJobs.next')}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleJump} className="flex items-center gap-1.5">
        <span aria-hidden="true" className="whitespace-nowrap text-sm text-muted-foreground">
          {t('latestJobs.goToPage')}
        </span>
        <Input
          type="number"
          inputMode="numeric"
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          aria-label={t('latestJobs.goToPage')}
          className="h-8 w-16"
        />
        <Button type="submit" size="icon" variant="outline" className="h-8 w-8">
          <ArrowRight className="h-4 w-4" />
          <span className="sr-only">{t('latestJobs.goToPageButton')}</span>
        </Button>
      </form>
    </nav>
  )
}
