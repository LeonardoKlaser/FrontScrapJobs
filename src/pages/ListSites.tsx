import { useState, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, CheckCircle, Radar, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { RegistrationModal } from '@/components/companyPopup'
import { useSiteCareer } from '@/hooks/useSiteCareer'
import type { SiteCareer } from '@/models/siteCareer'
import {
  useRegisterUserSite,
  useUnregisterUserSite,
  useUpdateUserSiteFilters
} from '@/hooks/useRegisterUserSite'
import { useUser } from '@/hooks/useUser'
import { FilterPills } from '@/components/common/filter-pills'
import { EmptyState } from '@/components/common/empty-state'
import { RequestSiteBanner } from '@/components/sites/request-site-banner'
import { RequestSiteForm } from '@/components/sites/request-site-form'
import { PageHeader } from '@/components/common/page-header'

export default function EmpresasPage() {
  const { t } = useTranslation('sites')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<SiteCareer>()
  const [isPopupOpen, setPopupOpen] = useState(false)
  const { data } = useSiteCareer()
  const { data: user } = useUser()
  const [filter, setFilter] = useState('all')
  const hasAutoSelected = useRef(false)

  useEffect(() => {
    if (!hasAutoSelected.current && data && data.some((c) => c.is_subscribed)) {
      setFilter('subscribed')
      hasAutoSelected.current = true
    }
  }, [data])
  const { mutate: registerUserToSite, isPending: isRegisteringUser } = useRegisterUserSite()
  const { mutate: unregisterUser } = useUnregisterUserSite()
  const { mutate: updateFilters, isPending: isUpdatingFilters } = useUpdateUserSiteFilters()

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

  const handleUpdateFilters = (targetWords: string[]) => {
    if (!selectedCompany) return
    updateFilters(
      { siteId: selectedCompany.site_id, targetWords },
      {
        onSuccess: () => {
          setPopupOpen(false)
        }
      }
    )
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
      <PageHeader title={t('title')} description={t('description')} />

      {/* Stats row */}
      <div
        className="animate-fade-in-up grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto [animation-delay:50ms]"
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

      {/* Request banner */}
      <div className="animate-fade-in-up [animation-delay:75ms]">
        <RequestSiteBanner />
      </div>

      {/* Search + Filters */}
      <div
        className="animate-fade-in-up max-w-md mx-auto space-y-3 [animation-delay:100ms]"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
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
            className="animate-fade-in-up hover-lift group relative flex flex-col items-center gap-2 sm:gap-3 rounded-lg border border-border/50 bg-card p-3 sm:p-5 text-center transition-all duration-150 hover:border-primary/20 hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ animationDelay: `${150 + index * 40}ms` }}
            onClick={() => handleCompanyClick(company)}
          >
            {company.is_subscribed && (
              <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">
                <CheckCircle className="size-3" />
              </Badge>
            )}
            <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-lg bg-muted/30 p-2">
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
        <>
          <EmptyState icon={Search} title={t('emptySearch', { term: searchTerm })} />
          {searchTerm && (
            <div className="w-full max-w-md mx-auto rounded-lg border border-primary/20 bg-primary/5 p-5 space-y-3">
              <div className="flex items-center gap-2 justify-center">
                <Radar className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">{t('emptySearchRequest.title')}</p>
              </div>
              <p className="text-xs text-muted-foreground text-center">{t('emptySearchRequest.description')}</p>
              <RequestSiteForm />
            </div>
          )}
        </>
      )}

      <RegistrationModal
        key={selectedCompany?.site_id}
        isOpen={isPopupOpen}
        onClose={() => setPopupOpen(false)}
        companyName={selectedCompany?.site_name}
        companyLogo={selectedCompany?.logo_url}
        remainingSlots={remainingSlots}
        isAlreadyRegistered={selectedCompany?.is_subscribed}
        isLoading={isRegisteringUser}
        onRegister={handleRegister}
        onUnRegister={handleUnregister}
        currentTargetWords={selectedCompany?.target_words}
        onUpdateFilters={handleUpdateFilters}
        isUpdatingFilters={isUpdatingFilters}
      />
    </div>
  )
}
