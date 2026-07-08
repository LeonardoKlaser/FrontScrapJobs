import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'

interface UltraBannerProps {
  totalCovered: number
}

export function UltraBanner({ totalCovered }: UltraBannerProps) {
  const { t } = useTranslation('sites')

  return (
    <div className="rounded-lg border border-primary bg-primary/5 px-4 py-3">
      <div className="flex items-start gap-2">
        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">
          {t('ultra.banner', {
            count: totalCovered,
            defaultValue:
              'Você está no Ultra — todas as {{count}} empresas do ScrapJobs são ' +
              'monitoradas automaticamente. Novas empresas são adicionadas assim que integramos.'
          })}
        </p>
      </div>
    </div>
  )
}
