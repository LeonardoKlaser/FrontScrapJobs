import { useState } from 'react'
import { useParams } from 'react-router'
import axios from 'axios'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CompanyCard } from '@/components/onboarding/CompanyCard'
import { useOnboardingPage, useOnboardingSubscribe } from '@/hooks/useOnboarding'

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  )
}

function ExpiredScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <h1 className="text-xl font-semibold">Link expirado</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Mande mensagem no WhatsApp para receber um novo link de empresas.
      </p>
    </div>
  )
}

function ErrorScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <h1 className="text-xl font-semibold">Algo deu errado</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Não foi possível carregar suas empresas agora. Tente novamente em alguns instantes.
      </p>
    </div>
  )
}

function SuccessScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle className="h-7 w-7 text-primary" />
      </div>
      <h1 className="text-xl font-semibold">Inscrições confirmadas!</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Volte ao WhatsApp para continuar recebendo suas vagas.
      </p>
    </div>
  )
}

export default function OnboardingCompaniesPage() {
  const { token } = useParams<{ token: string }>()
  const { data, isLoading, isError, error } = useOnboardingPage(token)
  const subscribeMutation = useOnboardingSubscribe(token)

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isExpired = isError && axios.isAxiosError(error) && error.response?.status === 404

  const available = data ? Math.max(data.plan_site_limit - data.sites_used, 0) : 0
  const limitReached = selectedIds.length >= available

  const toggleSite = (siteId: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(siteId)) {
        return prev.filter((id) => id !== siteId)
      }
      if (prev.length >= available) {
        return prev
      }
      return [...prev, siteId]
    })
  }

  const handleSubmit = () => {
    if (selectedIds.length === 0) return
    setSubmitError(null)
    subscribeMutation.mutate(
      { site_ids: selectedIds },
      {
        onError: (err) => {
          if (axios.isAxiosError(err) && err.response?.status === 422) {
            setSubmitError(
              'Limite do seu plano excedido. Reduza a quantidade de empresas selecionadas.'
            )
          } else {
            setSubmitError('Não foi possível confirmar suas inscrições. Tente novamente.')
          }
        }
      }
    )
  }

  if (subscribeMutation.isSuccess) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8">
        <SuccessScreen />
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-5 px-4 py-8 pb-24">
      {isLoading && <LoadingSkeleton />}

      {isExpired && <ExpiredScreen />}
      {isError && !isExpired && <ErrorScreen />}

      {data && (
        <>
          <header className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight">
              Olá, {data.user_name}! Encontramos empresas pra você
            </h1>
            <p className="text-sm text-muted-foreground">
              Selecione as empresas que você quer acompanhar.
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              Selecionadas: {selectedIds.length}/{available}
            </p>
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.companies.map((company) => {
              const checked = selectedIds.includes(company.site_id)
              const disabled = !checked && limitReached
              return (
                <CompanyCard
                  key={company.site_id}
                  company={company}
                  checked={checked}
                  disabled={disabled}
                  onToggle={toggleSite}
                />
              )
            })}
          </div>

          {submitError && <p className="text-center text-sm text-destructive">{submitError}</p>}

          <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border/50 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                {selectedIds.length} selecionada{selectedIds.length === 1 ? '' : 's'}
              </span>
              <Button
                variant="default"
                disabled={selectedIds.length === 0 || subscribeMutation.isPending}
                onClick={handleSubmit}
              >
                {subscribeMutation.isPending ? 'Inscrevendo...' : 'Confirmar inscrições'}
              </Button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
