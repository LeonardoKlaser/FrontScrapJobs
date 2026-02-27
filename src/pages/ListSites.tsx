import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, CheckCircle, Radar, Search, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RegistrationModal } from '@/components/companyPopup'
import { useSiteCareer } from '@/hooks/useSiteCareer'
import { useRequestSite } from '@/hooks/useRequestSite'
import type { SiteCareer } from '@/models/siteCareer'
import { useRegisterUserSite, useUnregisterUserSite } from '@/hooks/useRegisterUserSite'
import { useUser } from '@/hooks/useUser'
import { FilterPills } from '@/components/common/filter-pills'
import { EmptyState } from '@/components/common/empty-state'
import { toast } from 'sonner'

export default function EmpresasPage() {
  const { t } = useTranslation('sites')
  const [searchTerm, setSearchTerm] = useState('')
  const [requestedUrl, setRequestedUrl] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<SiteCareer>()
  const [isPopupOpen, setPopupOpen] = useState(false)
  const { data } = useSiteCareer()
  const { data: user } = useUser()
  const [filter, setFilter] = useState('all')
  const { mutate: requestSite, isPending } = useRequestSite()
  const { mutate: registerUserToSite, isPending: isRegisteringUser } = useRegisterUserSite()
  const { mutate: unregisterUser } = useUnregisterUserSite()

  const filters = [
    { key: 'all', label: t('filterAll') },
    { key: 'subscribed', label: t('filterSubscribed') },
    { key: 'not_subscribed', label: t('filterAvailable') }
  ] as const

  const filteredCompanies = useMemo(() => {
    return data
      ?.filter((company) => company.site_name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((company) => {
        if (filter === 'subscribed') return company.is_subscribed
        if (filter === 'not_subscribed') return !company.is_subscribed
        return true
      })
  }, [searchTerm, data, filter])

  const subscribedCount = useMemo(() => {
    return data?.filter((company) => company.is_subscribed).length ?? 0
  }, [data])

  const totalCount = data?.length ?? 0
  const maxSites = user?.plan?.max_sites ?? 3
  const remainingSlots = Math.max(0, maxSites - subscribedCount)

  const handleCompanyClick = (company: SiteCareer) => {
    setSelectedCompany(company)
    setPopupOpen(true)
  }

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (requestedUrl) {
      requestSite(requestedUrl, {
        onSuccess: () => {
          toast.success(t('requestSite.success'))
          setRequestedUrl('')
        },
        onError: (err) => {
          toast.error(err?.message || t('requestSite.error'))
        }
      })
    }
  }

  const handleRegister = (targetWords: string[]) => {
    if (!selectedCompany) return

    const requestData = {
      site_id: selectedCompany.site_id,
      target_words: targetWords
    }

    registerUserToSite(requestData, {
      onSuccess: () => {
        setPopupOpen(false)
      }
    })
  }

  const handleUnregister = () => {
    if (selectedCompany) {
      unregisterUser(selectedCompany.site_id, {
        onSuccess: () => {
          setPopupOpen(false)
        }
      })
    }
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="animate-fade-in-up text-center">
        <h1 className="text-gradient-primary text-3xl font-bold tracking-tight sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-muted-foreground text-pretty max-w-2xl mx-auto">
          {t('description')}
        </p>
      </div>

      {/* Stats row */}
      <div
        className="animate-fade-in-up grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto"
        style={{ animationDelay: '50ms' }}
      >
        <div className="text-center">
          <p className="text-2xl font-display font-bold text-foreground">{totalCount}</p>
          <p className="text-xs text-muted-foreground">{t('stats.companies')}</p>
        </div>
        <div className="text-center border-x border-border/50">
          <p className="text-2xl font-display font-bold text-primary">{subscribedCount}</p>
          <p className="text-xs text-muted-foreground">{t('stats.subscribed')}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-display font-bold text-foreground">{remainingSlots}</p>
          <p className="text-xs text-muted-foreground">{t('stats.freeSlots')}</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div
        className="animate-fade-in-up max-w-md mx-auto space-y-3"
        style={{ animationDelay: '100ms' }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex justify-center">
          <FilterPills options={filters} activeKey={filter} onChange={setFilter} />
        </div>
      </div>

      {/* Company grid */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {filteredCompanies?.map((company, index) => (
          <button
            key={company.site_id}
            className="animate-fade-in-up hover-lift group relative flex flex-col items-center gap-3 rounded-lg border border-border/50 bg-card p-5 text-center transition-all duration-150 hover:border-primary/20 hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ animationDelay: `${150 + index * 40}ms` }}
            onClick={() => handleCompanyClick(company)}
          >
            {company.is_subscribed && (
              <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">
                <CheckCircle className="size-3" />
              </Badge>
            )}
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted/30 p-2">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={`${company.site_name} logo`}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <Building2 className="size-6 text-muted-foreground" />
              )}
            </div>
            <span className="text-sm font-medium text-foreground leading-tight">
              {company.site_name}
            </span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filteredCompanies?.length === 0 && (
        <EmptyState icon={Search} title={t('emptySearch', { term: searchTerm })} />
      )}

      {/* Request section */}
      <Card className="animate-fade-in-up max-w-2xl mx-auto" style={{ animationDelay: '200ms' }}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Radar className="size-5 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl tracking-tight">{t('requestSite.title')}</CardTitle>
          <CardDescription className="text-sm">{t('requestSite.description')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleRequestSubmit} className="space-y-4 px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-end gap-2">
            <div className="w-full space-y-1.5">
              <Label htmlFor="siteUrl" className="text-muted-foreground text-sm">
                {t('requestSite.label')}
              </Label>
              <Input
                id="siteUrl"
                type="url"
                placeholder={t('requestSite.placeholder')}
                value={requestedUrl}
                onChange={(e) => setRequestedUrl(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="glow" disabled={isPending}>
              {isPending ? t('requestSite.sending') : t('requestSite.send')}
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>

      <RegistrationModal
        isOpen={isPopupOpen}
        onClose={() => setPopupOpen(false)}
        companyName={selectedCompany?.site_name}
        companyLogo={selectedCompany?.logo_url}
        remainingSlots={remainingSlots}
        isAlreadyRegistered={selectedCompany?.is_subscribed}
        isLoading={isRegisteringUser}
        onRegister={handleRegister}
        onUnRegister={handleUnregister}
      />
    </div>
  )
}
