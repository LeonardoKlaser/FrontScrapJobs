import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router'
import type { Plan } from '@/models/plan'
import { PricingSection } from '../pricing-section'

const { usePlansMock, trackLandingMock } = vi.hoisted(() => ({
  usePlansMock: vi.fn(),
  trackLandingMock: vi.fn()
}))

vi.mock('@/hooks/usePlans', () => ({ usePlans: usePlansMock }))
vi.mock('@/lib/analytics', () => ({ trackLanding: trackLandingMock }))

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

const refetch = vi.fn()
const successfulPlansState = {
  data: [ultra, profissional],
  isLoading: false,
  isError: false,
  failureCount: 0,
  refetch
}
const failedPlansState = {
  data: undefined,
  isLoading: false,
  isError: true,
  failureCount: 1,
  refetch
}

function CurrentLocation() {
  const location = useLocation()
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>
}

function renderPricing() {
  return render(
    <MemoryRouter>
      <PricingSection />
      <CurrentLocation />
    </MemoryRouter>
  )
}

describe('PricingSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza dados estruturados e ignora features', () => {
    usePlansMock.mockReturnValue(successfulPlansState)

    renderPricing()

    expect(screen.getByText('R$ 19,90')).toBeInTheDocument()
    expect(screen.getByText('Até 40 empresas monitoradas')).toBeInTheDocument()
    expect(screen.getByText('20 análises de compatibilidade por mês')).toBeInTheDocument()
    expect(screen.queryByText('NÃO RENDERIZAR')).not.toBeInTheDocument()
  })

  it('registra posição e navega com o id do plano', () => {
    usePlansMock.mockReturnValue(successfulPlansState)

    renderPricing()
    fireEvent.click(screen.getByRole('button', { name: 'Assinar Profissional' }))

    expect(trackLandingMock).toHaveBeenCalledWith('lp_plan_click', {
      plan_id: 2,
      plan_name: 'Profissional',
      position: 1,
      origin: 'landing_pricing'
    })
    expect(screen.getByTestId('location')).toHaveTextContent('/signup?plan=2')
  })

  it('mostra erro, mede uma vez e permite tentar novamente', async () => {
    usePlansMock.mockReturnValue(failedPlansState)

    renderPricing()

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar os planos')
    await waitFor(() => {
      expect(trackLandingMock).toHaveBeenCalledWith('lp_plans_load_error', { attempt: 1 })
    })
    expect(trackLandingMock).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })
})
