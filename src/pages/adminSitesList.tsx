import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Building2, Plus, Pencil, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import { useAdminSites } from '@/hooks/useSiteCareer'
import { PATHS } from '@/router/paths'

const DATE_FMT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})

// Module-scope — evita recriar a cada render, consistente com ListSites.tsx.
const collator = new Intl.Collator('pt', { sensitivity: 'base' })

export default function AdminSitesListPage() {
  const { t } = useTranslation('admin')
  const navigate = useNavigate()
  const { data, isLoading } = useAdminSites()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!data) return []
    const term = search.trim().toLocaleLowerCase('pt')
    if (!term) return data
    return data.filter((s) => s.site_name.toLocaleLowerCase('pt').includes(term))
  }, [data, search])

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => collator.compare(a.site_name, b.site_name)),
    [filtered]
  )

  return (
    <div className="space-y-10">
      <PageHeader
        title={t('adminSites.title', { defaultValue: 'Gerenciar Sites' })}
        description={t('adminSites.description', {
          defaultValue: 'Lista completa de sites cadastrados (ativos e inativos).'
        })}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={t('adminSites.searchPlaceholder', { defaultValue: 'Buscar por nome...' })}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => navigate(PATHS.app.addNewSite)} variant="glow">
          <Plus className="size-4" />
          {t('adminSites.newSite', { defaultValue: '+ Novo Site' })}
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">
          {t('adminSites.loading', { defaultValue: 'Carregando...' })}
        </p>
      )}

      {!isLoading && sorted.length === 0 && (
        <EmptyState
          icon={Building2}
          title={t('adminSites.empty', { defaultValue: 'Nenhum site encontrado' })}
        />
      )}

      {!isLoading && sorted.length > 0 && (
        <div className="overflow-auto rounded-lg border border-border/50">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium w-16">
                  {t('adminSites.col.logo', { defaultValue: 'Logo' })}
                </th>
                <th className="text-left p-3 font-medium">
                  {t('adminSites.col.name', { defaultValue: 'Nome' })}
                </th>
                <th className="text-left p-3 font-medium">
                  {t('adminSites.col.type', { defaultValue: 'Tipo' })}
                </th>
                <th className="text-left p-3 font-medium">
                  {t('adminSites.col.status', { defaultValue: 'Status' })}
                </th>
                <th className="text-left p-3 font-medium">
                  {t('adminSites.col.createdAt', { defaultValue: 'Cadastrado' })}
                </th>
                <th className="text-right p-3 font-medium w-24">
                  {t('adminSites.col.actions', { defaultValue: 'Ações' })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {sorted.map((site) => (
                <tr key={site.id} className="hover:bg-muted/20">
                  <td className="p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-muted/30">
                      {site.logo_url ? (
                        <img
                          src={site.logo_url}
                          alt={`${site.site_name} logo`}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Building2 className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-medium text-foreground">{site.site_name}</td>
                  <td className="p-3">
                    <Badge variant="secondary" className="text-xs">
                      {site.scraping_type}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs ${
                        site.is_active ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          site.is_active ? 'bg-primary' : 'bg-muted-foreground/40'
                        }`}
                      />
                      {site.is_active
                        ? t('adminSites.active', { defaultValue: 'Ativo' })
                        : t('adminSites.inactive', { defaultValue: 'Inativo' })}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {site.created_at ? DATE_FMT.format(new Date(site.created_at)) : '—'}
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(PATHS.app.editSite(site.id))}
                      aria-label={`Editar ${site.site_name}`}
                    >
                      <Pencil className="size-3.5" />
                      {t('adminSites.edit', { defaultValue: 'Editar' })}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
