import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, Navigate, Link } from 'react-router'
import { toast } from 'sonner'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import SiteConfigForm from '@/components/sites/site-config-form'
import { useSite, useUpdateSiteConfig } from '@/hooks/useSiteCareer'
import type { SiteConfigFormData } from '@/services/siteCareerService'
import { PATHS } from '@/router/paths'

interface AxiosLikeError extends Error {
  response?: { status?: number }
}

function isNotFoundError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const ax = err as AxiosLikeError
  return ax.response?.status === 404
}

export default function EditSitePage() {
  const { t } = useTranslation('admin')
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const siteId = parseInt(id ?? '', 10)

  // Hooks devem ser chamados incondicionalmente (Rules of Hooks). useSite
  // ja tem `enabled: id > 0`, entao o fetch nao dispara pra id invalido.
  const { data, isLoading, error, refetch } = useSite(siteId)
  const { mutateAsync } = useUpdateSiteConfig()

  if (Number.isNaN(siteId) || siteId <= 0) {
    return <Navigate to={PATHS.app.adminSites} replace />
  }

  if (isLoading) {
    return (
      <div className="space-y-10">
        <PageHeader
          title={t('editSite.title', { defaultValue: 'Editar Site' })}
          description={t('editSite.loading', { defaultValue: 'Carregando...' })}
        />
      </div>
    )
  }

  if (error) {
    if (isNotFoundError(error)) {
      return (
        <EmptyState
          icon={Building2}
          title={t('editSite.notFound', { defaultValue: 'Site não encontrado' })}
          action={
            <Button asChild variant="outline" size="sm">
              <Link to={PATHS.app.adminSites}>Voltar para a lista</Link>
            </Button>
          }
        />
      )
    }
    return (
      <EmptyState
        icon={Building2}
        title={t('editSite.loadError', { defaultValue: 'Erro ao carregar site' })}
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        }
      />
    )
  }

  if (!data) return null

  const handleSubmit = async (formData: SiteConfigFormData, logoFile: File | null) => {
    await mutateAsync({ id: siteId, formData, logoFile })
    toast.success(t('editSite.success', { defaultValue: 'Site atualizado com sucesso!' }))
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title={t('editSite.title', { defaultValue: 'Editar Site' })}
        description={data.site_name}
      />
      <SiteConfigForm
        mode="edit"
        initialData={data}
        submitLabel={t('editSite.submitButton', { defaultValue: 'Salvar Alterações' })}
        onSubmit={handleSubmit}
        onSubmitSuccess={() => navigate(PATHS.app.adminSites)}
      />
    </div>
  )
}
