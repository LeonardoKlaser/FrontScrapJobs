import { useState, useMemo } from 'react'
import { CheckCircle, Search, Send, XCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RegistrationModal } from '@/components/companyPopup'
import { useSiteCareer } from '@/hooks/useSiteCareer'
import { Badge } from '@/components/ui/badge'
import { useRequestSite } from '@/hooks/useRequestSite'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { SiteCareer } from '@/models/siteCareer'
import { useRegisterUserSite, useUnregisterUserSite } from '@/hooks/useRegisterUserSite'

export default function EmpresasPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [requestedUrl, setRequestedUrl] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<SiteCareer>()
  const [isPopupOpen, setPopupOpen] = useState(false)
  const { data } = useSiteCareer()
  const [filter, setFilter] = useState('all')
  const { mutate: requestSite, isPending, isSuccess, isError, error } = useRequestSite()
  const { mutate: registerUserToSite, isPending: isRegisteringUser } = useRegisterUserSite()
  const { mutate: unregisterUser } = useUnregisterUserSite()

  const filteredCompanies = useMemo(() => {
    return data
      ?.filter((company) => company.SiteName.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((company) => {
        if (filter === 'subscribed') return company.IsSubscribed
        if (filter === 'not_subscribed') return !company.IsSubscribed
        return true
      })
  }, [searchTerm, data, filter])

  const handleCompanyClick = (company: SiteCareer) => {
    setSelectedCompany(company)
    setPopupOpen(true)
  }

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (requestedUrl) {
      requestSite(requestedUrl, {
        onSuccess: () => {
          setRequestedUrl('')
        }
      })
    }
  }

  const handleRegister = (targetWords: string[]) => {
    if (!selectedCompany) return

    const requestData = {
      site_id: selectedCompany.SiteId,
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
      unregisterUser(selectedCompany.SiteId, {
        onSuccess: () => {
          setPopupOpen(false)
        }
      })
    }
  }

  return (
    <div className="scrapjobs-theme min-h-screen">
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#e0e0e0] mb-6 fade-in text-balance">
            Monitore as Empresas dos Seus Sonhos
          </h1>
          <p className="text-xl text-[#e0e0e0] max-w-4xl mx-auto leading-relaxed fade-in text-pretty">
            Nossa plataforma monitora 24/7 as páginas de carreira das maiores empresas do mercado.
            Deixe o trabalho duro conosco e nunca mais perca uma oportunidade.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#e0e0e0] h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar por uma empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1e1e1e] border-[#333333] text-[#e0e0e0] placeholder:text-[#e0e0e0]/60 focus:border-[#007bff] focus:ring-[#007bff]"
              />
            </div>
            <div className="flex items-center justify-center mb-8" />
            <div className="bg-card border border-border rounded-lg p-1 flex">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
                  filter == 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Todas
                {filter == 'all' && (
                  <Badge className="absolute -top-2 -right-2 bg-success text-success-foreground text-xs" />
                )}
              </button>
              <button
                onClick={() => setFilter('subscribed')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filter == 'subscribed'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Inscrito
              </button>
              <button
                onClick={() => setFilter('not_subscribed')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
                  filter == 'not_subscribed'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Não inscrito
                {filter == 'not_subscribed' && (
                  <Badge className="absolute -top-2 -right-2 bg-success text-success-foreground text-xs" />
                )}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredCompanies?.map((company, index) => (
              <Card
                key={company.SiteId}
                className="scrapjobs-card company-card-hover p-6 text-center cursor-pointer fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleCompanyClick(company)}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <img
                      src={company.LogoURL || '/placeholder.svg'}
                      alt={`${company.SiteName} logo`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <h3 className="text-[#e0e0e0] font-semibold text-sm">{company.SiteName}</h3>
                </div>
              </Card>
            ))}
          </div>

          {filteredCompanies?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#e0e0e0]/60 text-lg">
                Nenhuma empresa encontrada para "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="max-w-3xl mx-auto bg-card/50 border-border/50 px-20">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">
                Expanda seu Radar de Vagas
              </CardTitle>
              <CardDescription className="text-lg pt-2">
                Não encontrou uma empresa? Adicione o portal de carreiras dela e não perca nenhuma
                oportunidade.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              {isSuccess && (
                <Alert className="border-green-500 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-500">
                    Solicitação enviada com sucesso!
                  </AlertDescription>
                </Alert>
              )}
              {isError && (
                <Alert className="border-red-500 bg-red-500/10">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-500">
                    {error?.message || 'Ocorreu um erro ao enviar a solicitação.'}
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex flex-col sm:flex-row items-end gap-2">
                <div className="w-full space-y-2">
                  <Label htmlFor="siteUrl" className="text-muted-foreground">
                    Link do portal de carreiras
                  </Label>
                  <Input
                    id="siteUrl"
                    type="url"
                    placeholder="https://exemplo.com/carreiras"
                    className="py-6 text-base"
                    value={requestedUrl}
                    onChange={(e) => setRequestedUrl(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-3 text-base"
                  disabled={isPending}
                >
                  <span className="mr-2">{isPending ? 'Enviando...' : 'Enviar'}</span>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>

      <footer className="border-t border-[#333333] bg-[#121212] py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#e0e0e0]/60">© 2025 ScrapJobs. Todos os direitos reservados.</p>
        </div>
      </footer>
      <RegistrationModal
        isOpen={isPopupOpen}
        onClose={() => setPopupOpen(false)}
        companyName={selectedCompany?.SiteName}
        companyLogo={selectedCompany?.LogoURL}
        remainingSlots={1}
        isAlreadyRegistered={selectedCompany?.IsSubscribed}
        isLoading={isRegisteringUser}
        onRegister={handleRegister}
        onUnRegister={handleUnregister}
      />
    </div>
  )
}
