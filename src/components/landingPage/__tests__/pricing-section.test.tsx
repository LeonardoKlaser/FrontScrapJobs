import { StrictMode, act } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router'
import type { Plan } from '@/models/plan'
import { planService } from '@/services/planService'
import { PricingSection } from '../pricing-section'

const profissional: Plan = {
  id: 2,
  name: 'Profissional',
  price: 19.9,
  max_sites: 40,
  max_ai_analyses: 20,
  is_trial: false,
  is_ultra: false,
  features: ['NÃO RENDERIZAR']
}

const ultra: Plan = {
  id: 3,
  name: 'Ultra',
  price: 29.9,
  max_sites: 0,
  max_ai_analyses: 50,
  is_trial: false,
  is_ultra: true,
  features: ['NÃO RENDERIZAR']
}

const plans = [ultra, profissional]

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retryDelay: 0
      }
    }
  })
}

function CurrentLocation() {
  const location = useLocation()
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>
}

function PricingTree({
  queryClient,
  strictMode = false
}: {
  queryClient: QueryClient
  strictMode?: boolean
}) {
  const content = (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <PricingSection />
        <CurrentLocation />
      </MemoryRouter>
    </QueryClientProvider>
  )

  return strictMode ? <StrictMode>{content}</StrictMode> : content
}

function renderPricing({ strictMode = false } = {}) {
  const queryClient = createQueryClient()
  return {
    queryClient,
    ...render(<PricingTree queryClient={queryClient} strictMode={strictMode} />)
  }
}

function plansLoadErrors() {
  return (window.dataLayer ?? []).filter(({ event }) => event === 'lp_plans_load_error')
}

describe('PricingSection', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    window.dataLayer = []
  })

  it('renderiza dados estruturados e ignora features', async () => {
    vi.spyOn(planService, 'getAllPlans').mockResolvedValue(plans)

    renderPricing()

    expect(await screen.findByText('R$ 19,90')).toBeInTheDocument()
    expect(screen.getByText('Até 40 empresas monitoradas')).toBeInTheDocument()
    expect(screen.getByText('20 análises de compatibilidade por mês')).toBeInTheDocument()
    expect(screen.queryByText('NÃO RENDERIZAR')).not.toBeInTheDocument()
  })

  it('registra posição e navega com o id do plano', async () => {
    vi.spyOn(planService, 'getAllPlans').mockResolvedValue(plans)

    renderPricing()
    fireEvent.click(await screen.findByRole('button', { name: 'Assinar Profissional' }))

    expect(window.dataLayer).toContainEqual({
      event: 'lp_plan_click',
      plan_id: 2,
      plan_name: 'Profissional',
      position: 1,
      origin: 'landing_pricing'
    })
    expect(screen.getByTestId('location')).toHaveTextContent('/signup?plan=2')
  })

  it('mede a primeira falha terminal como tentativa 1 uma vez em StrictMode', async () => {
    vi.spyOn(planService, 'getAllPlans').mockRejectedValue(new Error('Erro'))

    const { queryClient } = renderPricing({ strictMode: true })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os planos'
    )
    await waitFor(() => {
      expect(plansLoadErrors()).toEqual([{ event: 'lp_plans_load_error', attempt: 1 }])
    })
    expect(queryClient.getQueryState(['plans'])?.fetchFailureCount).toBe(4)
  })

  it('mede um novo refetch terminalmente falho como tentativa 2', async () => {
    vi.spyOn(planService, 'getAllPlans').mockRejectedValue(new Error('Erro'))

    renderPricing()

    await screen.findByRole('alert')
    await waitFor(() => {
      expect(plansLoadErrors()).toHaveLength(1)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    await waitFor(() => {
      expect(plansLoadErrors()).toEqual([
        { event: 'lp_plans_load_error', attempt: 1 },
        { event: 'lp_plans_load_error', attempt: 2 }
      ])
    })
  })

  it('reinicia a tentativa visível depois de uma recuperação', async () => {
    const getAllPlans = vi.spyOn(planService, 'getAllPlans').mockRejectedValue(new Error('Erro'))

    const { queryClient } = renderPricing()

    await screen.findByRole('alert')
    await waitFor(() => {
      expect(plansLoadErrors()).toHaveLength(1)
    })

    getAllPlans.mockResolvedValue(plans)
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByRole('button', { name: 'Assinar Profissional' })).toBeInTheDocument()

    getAllPlans.mockRejectedValue(new Error('Erro novamente'))
    await act(async () => {
      await queryClient.refetchQueries({ queryKey: ['plans'] })
    })

    await waitFor(() => {
      expect(plansLoadErrors()).toEqual([
        { event: 'lp_plans_load_error', attempt: 1 },
        { event: 'lp_plans_load_error', attempt: 1 }
      ])
    })
  })
})
