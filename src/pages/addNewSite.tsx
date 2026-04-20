import { PageHeader } from '@/components/common/page-header'
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
    <div className="space-y-10">
      <PageHeader title={t('addSite.title')} description={t('addSite.description')} />
      <SiteConfigForm
        mode="create"
        submitLabel={t('addSite.submitButton')}
        onSubmit={handleSubmit}
        onSubmitSuccess={() => window.scrollTo(0, 0)}
      />
    </div>
  )
}
