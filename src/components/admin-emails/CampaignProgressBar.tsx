import { useTranslation } from 'react-i18next'
import { Progress } from '@/components/ui/progress'

interface CampaignProgressBarProps {
  sent: number
  failed: number
  recipient: number | null | undefined
}

// Distingue 3 estados pra evitar UI ambigua (multi-review apontou que
// recipient===0 mostrava "Aguardando..." igual recipient===null, escondendo
// segmento vazio):
//   - recipient null/undefined → ainda nao calculado (campanha nao iniciou)
//   - recipient === 0          → segmento vazio (campanha provavelmente failed)
//   - recipient > 0            → barra de progresso real
export const CampaignProgressBar = ({ sent, failed, recipient }: CampaignProgressBarProps) => {
  const { t } = useTranslation('admin-emails')
  if (recipient == null) {
    return <p className="text-sm text-muted-foreground">{t('campaigns.progress.waiting')}</p>
  }
  if (recipient === 0) {
    return <p className="text-sm text-muted-foreground">{t('campaigns.progress.empty')}</p>
  }
  const total = sent + failed
  const pct = Math.min(100, Math.round((total / recipient) * 100))
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {total} / {recipient} ({pct}%)
        </span>
        {failed > 0 && (
          <span className="text-destructive">
            {t('campaigns.progress.failuresCount', { count: failed })}
          </span>
        )}
      </div>
      <Progress value={pct} />
    </div>
  )
}
