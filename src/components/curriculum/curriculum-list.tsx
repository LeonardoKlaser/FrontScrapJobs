import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, PlusCircle, FileText } from 'lucide-react'
import type { Curriculum } from '@/models/curriculum'
import { useSetActiveCurriculum } from '@/hooks/useCurriculum'
import { EmptyState } from '@/components/common/empty-state'

interface CurriculumListProps {
  curriculums: Curriculum[] | undefined
  selectedId: number | null
  onSelect: (id: number) => void
  onCreateNew: () => void
}

export function CurriculumList({
  curriculums,
  selectedId,
  onSelect,
  onCreateNew
}: CurriculumListProps) {
  const { t } = useTranslation('curriculum')
  const { mutate: setActive, isPending } = useSetActiveCurriculum()
  const [activatingId, setActivatingId] = useState<number | null>(null)

  const handleSetActive = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setActivatingId(id)
    setActive(id, {
      onSettled: () => setActivatingId(null)
    })
  }

  const hasCurriculums = curriculums && curriculums.length > 0

  return (
    <div className="space-y-3 lg:sticky lg:top-8">
      <Button onClick={onCreateNew} variant="outline" className="w-full gap-2">
        <PlusCircle className="h-4 w-4" />
        {t('list.newButton')}
      </Button>

      {!hasCurriculums && (
        <EmptyState
          icon={FileText}
          title={t('list.emptyTitle')}
          description={t('list.emptyDescription')}
          action={
            <Button onClick={onCreateNew} variant="glow" size="sm">
              <PlusCircle className="h-4 w-4" />
              {t('list.createButton')}
            </Button>
          }
        />
      )}

      {hasCurriculums && (
        <div className="space-y-2">
          {curriculums.map((curriculum, index) => {
            const isSelected = selectedId === curriculum.id
            const isActivating = isPending && activatingId === curriculum.id

            return (
              <div
                key={curriculum.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-150 relative ${
                    isSelected
                      ? 'border-l-2 border-l-primary bg-primary/5 border-primary/30'
                      : 'hover:bg-muted/30'
                  }`}
                  onClick={() => onSelect(curriculum.id)}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm">{curriculum.title}</CardTitle>
                      {curriculum.is_active && (
                        <Badge variant="default" className="shrink-0 text-xs px-2 py-0">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          {t('list.active')}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs line-clamp-2 text-pretty">
                      {curriculum.summary || t('list.noSummary')}
                    </CardDescription>
                    {!curriculum.is_active && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleSetActive(e, curriculum.id)}
                        disabled={isActivating}
                        className="mt-1.5 w-fit h-7 text-xs text-muted-foreground hover:text-primary"
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {isActivating ? t('list.activating') : t('list.setActive')}
                      </Button>
                    )}
                  </CardHeader>
                </Card>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
