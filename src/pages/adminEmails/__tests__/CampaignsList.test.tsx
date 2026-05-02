import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'

import CampaignsList from '@/pages/adminEmails/CampaignsList'
import { useEmailCampaigns } from '@/hooks/useEmailCampaigns'
import type { EmailCampaign } from '@/models/emailCampaign'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

vi.mock('@/hooks/useEmailCampaigns', () => ({
  useEmailCampaigns: vi.fn()
}))

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

const sample = (overrides: Partial<EmailCampaign> = {}): EmailCampaign => ({
  id: 1,
  name: 'Promo BF',
  template_id: 1,
  segment_filter: {},
  status: 'draft',
  sent_count: 0,
  failed_count: 0,
  pickup_count: 0,
  created_at: '2026-05-02T00:00:00Z',
  updated_at: '2026-05-02T00:00:00Z',
  ...overrides
})

describe('CampaignsList', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renderiza linhas com nome + status badge', () => {
    vi.mocked(useEmailCampaigns).mockReturnValue({
      data: {
        data: [
          sample({ id: 1, name: 'Promo BF', status: 'draft' }),
          sample({
            id: 2,
            name: 'Onboarding Q3',
            status: 'sent',
            recipient_count: 100,
            sent_count: 100
          })
        ],
        total: 2
      },
      isLoading: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(wrap(<CampaignsList />))

    expect(screen.getByText('Promo BF')).toBeInTheDocument()
    expect(screen.getByText('Onboarding Q3')).toBeInTheDocument()
    // StatusBadge usa useTranslation; t mock retorna a key crua, então
    // assertamos contra o i18n key (não o label pt-BR final).
    expect(screen.getByText('campaigns.status.draft')).toBeInTheDocument()
    expect(screen.getByText('campaigns.status.sent')).toBeInTheDocument()
  })
})
