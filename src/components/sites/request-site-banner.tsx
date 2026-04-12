import { useTranslation } from 'react-i18next'
import { Radar } from 'lucide-react'
import { RequestSiteForm } from '@/components/sites/request-site-form'

export function RequestSiteBanner() {
  const { t } = useTranslation('sites')

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Radar className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            {t('requestBanner.text')}{' '}
            <span className="font-medium text-foreground">{t('requestBanner.cta')}</span>
          </p>
        </div>
        <RequestSiteForm className="sm:max-w-sm w-full" />
      </div>
    </div>
  )
}
