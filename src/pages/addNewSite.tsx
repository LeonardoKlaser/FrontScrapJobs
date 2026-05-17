import { AppPageHeader } from '@/components/common/app-page-header'
import SiteConfigForm from '@/components/sites/site-config-form'
import { useAddSiteConfig } from '@/hooks/useAddSiteConfig'
import type { SiteConfigFormData } from '@/services/siteCareerService'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export default function AdicionarSitePage() {
  const { t } = useTranslation('admin')
  const { mutateAsync } = useAddSiteConfig()

  const handleSubmit = async (formData: SiteConfigFormData, logoFile: File | null) => {
    await mutateAsync({ formData, logoFile })
    toast.success(t('addSite.addSuccess'))
  }

  return (
    <>
      <AppPageHeader title={t('pageTitle.addNewSite', { ns: 'common' })} />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        <p className="text-sm text-muted-foreground">{t('addSite.description')}</p>
        <SiteConfigForm
          mode="create"
          submitLabel={t('addSite.submitButton')}
          onSubmit={handleSubmit}
          onSubmitSuccess={() => window.scrollTo(0, 0)}
        />
      </div>
    </>
  )
}
