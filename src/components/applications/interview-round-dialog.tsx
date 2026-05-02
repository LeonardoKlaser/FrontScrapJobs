import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onConfirm: (round: number) => void
  onCancel: () => void
}

const PRESET_ROUNDS = [1, 2, 3] as const

export function InterviewRoundDialog({ open, onConfirm, onCancel }: Props) {
  const { t } = useTranslation('applications')
  const [selected, setSelected] = useState<number | null>(null)
  const [customValue, setCustomValue] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  useEffect(() => {
    if (open) {
      setSelected(null)
      setCustomValue('')
      setShowCustom(false)
    }
  }, [open])

  const handlePresetClick = (round: number) => {
    setSelected(round)
    setShowCustom(false)
    setCustomValue('')
  }

  const handleCustomClick = () => {
    setShowCustom(true)
    setSelected(null)
  }

  const handleConfirm = () => {
    if (showCustom) {
      const round = parseInt(customValue, 10)
      if (round >= 4) onConfirm(round)
    } else if (selected) {
      onConfirm(selected)
    }
  }

  const isValid = selected !== null || (showCustom && parseInt(customValue, 10) >= 4)

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onCancel()
      }}
    >
      <DialogContent className="max-w-[340px]">
        <DialogTitle>{t('kanban.interviewPrompt')}</DialogTitle>
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {PRESET_ROUNDS.map((round) => (
              <Button
                key={round}
                type="button"
                variant={selected === round ? 'default' : 'outline'}
                size="sm"
                className={cn('w-full', selected === round && 'ring-2 ring-primary/50')}
                onClick={() => handlePresetClick(round)}
              >
                {t(`kanban.interviewStage${round}`)}
              </Button>
            ))}
            <Button
              type="button"
              variant={showCustom ? 'default' : 'outline'}
              size="sm"
              className={cn('w-full', showCustom && 'ring-2 ring-primary/50')}
              onClick={handleCustomClick}
            >
              {t('kanban.interviewStage4Plus')}
            </Button>
          </div>

          {showCustom && (
            <Input
              type="number"
              min={4}
              placeholder={t('kanban.interviewRoundPlaceholder')}
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              autoFocus
            />
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              {t('common:actions.cancel', { defaultValue: 'Cancelar' })}
            </Button>
            <Button
              type="button"
              variant="glow"
              size="sm"
              disabled={!isValid}
              onClick={handleConfirm}
            >
              {t('common:actions.confirm', { defaultValue: 'Confirmar' })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
