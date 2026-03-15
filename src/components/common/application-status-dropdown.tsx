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
import { APPLICATION_STATUSES, STATUS_COLORS } from '@/models/application'
import type { ApplicationStatus } from '@/models/application'

interface Props {
  currentStatus: ApplicationStatus
  interviewRound?: number | null
  onStatusChange: (status: ApplicationStatus, interviewRound?: number) => void
}

export function ApplicationStatusDropdown({
  currentStatus,
  interviewRound,
  onStatusChange
}: Props) {
  const { t } = useTranslation('applications')
  const [showRoundInput, setShowRoundInput] = useState(false)
  const [roundValue, setRoundValue] = useState('')

  const displayLabel =
    currentStatus === 'interview' && interviewRound
      ? t('status.interview', { round: interviewRound })
      : t(`status.${currentStatus}`)

  const handleSelect = (status: ApplicationStatus) => {
    if (status === 'interview') {
      setShowRoundInput(true)
      setRoundValue('')
      return
    }
    onStatusChange(status)
  }

  const handleRoundConfirm = () => {
    const round = parseInt(roundValue, 10)
    if (round > 0) {
      onStatusChange('interview', round)
      setShowRoundInput(false)
      setRoundValue('')
    }
  }

  const activeStatuses = APPLICATION_STATUSES.filter((s) => s !== 'rejected' && s !== 'withdrawn')
  const terminalStatuses: ApplicationStatus[] = ['rejected', 'withdrawn']

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) setShowRoundInput(false)
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
      <DropdownMenuContent align="end" className="w-48">
        {showRoundInput ? (
          <div className="p-2 space-y-2">
            <p className="text-xs text-muted-foreground">{t('kanban.interviewPrompt')}</p>
            <Input
              type="number"
              min={1}
              placeholder={t('kanban.interviewRoundPlaceholder')}
              value={roundValue}
              onChange={(e) => setRoundValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRoundConfirm()
              }}
              autoFocus
              className="h-8 text-sm"
            />
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
