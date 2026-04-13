import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onConfirm: (round: number) => void
  onCancel: () => void
}

export function InterviewRoundDialog({ open, onConfirm, onCancel }: Props) {
  const { t } = useTranslation('applications')
  const [value, setValue] = useState('')

  useEffect(() => {
    if (open) setValue('')
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const round = parseInt(value, 10)
    if (round > 0) onConfirm(round)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onCancel()
      }}
    >
      <DialogContent className="max-w-[340px]">
        <DialogTitle>{t('kanban.interviewPrompt')}</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <Input
            type="number"
            min={1}
            placeholder={t('kanban.interviewRoundPlaceholder')}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              {t('common:actions.cancel', { defaultValue: 'Cancelar' })}
            </Button>
            <Button type="submit" variant="glow" size="sm" disabled={!value || parseInt(value, 10) < 1}>
              {t('common:actions.confirm', { defaultValue: 'Confirmar' })}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
