import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { APPLICATION_STATUSES, STATUS_COLORS } from '@/models/application'
import type { ApplicationStatus } from '@/models/application'
import { cn } from '@/lib/utils'

interface Props {
  currentStatus: ApplicationStatus
  interviewRound?: number | null
  onStatusChange: (status: ApplicationStatus, interviewRound?: number) => void
}

const PRESET_ROUNDS = [1, 2, 3] as const

export function ApplicationStatusDropdown({
  currentStatus,
  interviewRound,
  onStatusChange
}: Props) {
  const { t } = useTranslation('applications')
  const [showRoundInput, setShowRoundInput] = useState(false)
  const [selectedRound, setSelectedRound] = useState<number | null>(null)
  const [showCustom, setShowCustom] = useState(false)
  const [customValue, setCustomValue] = useState('')

  const displayLabel =
    currentStatus === 'interview' && interviewRound
      ? t('status.interview', { round: interviewRound })
      : t(`status.${currentStatus}`)

  const handleSelect = (status: ApplicationStatus) => {
    if (status === 'interview') {
      setShowRoundInput(true)
      setSelectedRound(null)
      setShowCustom(false)
      setCustomValue('')
      return
    }
    onStatusChange(status)
  }

  const handlePresetClick = (round: number) => {
    setSelectedRound(round)
    setShowCustom(false)
    setCustomValue('')
  }

  const handleCustomClick = () => {
    setShowCustom(true)
    setSelectedRound(null)
  }

  const handleConfirm = () => {
    if (showCustom) {
      const round = parseInt(customValue, 10)
      if (round >= 4) {
        onStatusChange('interview', round)
        setShowRoundInput(false)
      }
    } else if (selectedRound) {
      onStatusChange('interview', selectedRound)
      setShowRoundInput(false)
    }
  }

  const isValid = selectedRound !== null || (showCustom && parseInt(customValue, 10) >= 4)

  const activeStatuses = APPLICATION_STATUSES.filter((s) => s !== 'rejected' && s !== 'withdrawn')
  const terminalStatuses: ApplicationStatus[] = ['rejected', 'withdrawn']

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) {
          setShowRoundInput(false)
          setShowCustom(false)
          setSelectedRound(null)
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: STATUS_COLORS[currentStatus] }}
        >
          {displayLabel} ▾
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {showRoundInput ? (
          <div className="p-2 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">
              {t('kanban.interviewPrompt')}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESET_ROUNDS.map((round) => (
                <Button
                  key={round}
                  type="button"
                  variant={selectedRound === round ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'h-7 text-xs w-full',
                    selectedRound === round && 'ring-2 ring-primary/50'
                  )}
                  onClick={() => handlePresetClick(round)}
                >
                  {t(`kanban.interviewStage${round}`)}
                </Button>
              ))}
              <Button
                type="button"
                variant={showCustom ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'h-7 text-xs w-full',
                  showCustom && 'ring-2 ring-primary/50'
                )}
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
                className="h-7 text-xs"
              />
            )}
            <Button
              type="button"
              variant="glow"
              size="sm"
              className="w-full h-7 text-xs"
              disabled={!isValid}
              onClick={handleConfirm}
            >
              {t('common:actions.confirm', { defaultValue: 'Confirmar' })}
            </Button>
          </div>
        ) : (
          <>
            {activeStatuses.map((status) => (
              <DropdownMenuItem key={status} onClick={() => handleSelect(status)} className="gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                />
                {status === 'interview' ? t('status.interviewNoRound') : t(`status.${status}`)}
                {status === currentStatus && <span className="ml-auto text-xs">✓</span>}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {terminalStatuses.map((status) => (
              <DropdownMenuItem key={status} onClick={() => handleSelect(status)} className="gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                />
                {t(`status.${status}`)}
                {status === currentStatus && <span className="ml-auto text-xs">✓</span>}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
