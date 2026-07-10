import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NorteChat } from '@/components/landingPage/ui-snippets/norte-chat'

describe('NorteChat', () => {
  it('renders norte and user bubbles plus a pdf attachment', () => {
    render(
      <NorteChat
        messages={[
          { from: 'norte', text: 'Oi, Erick!' },
          { from: 'user', text: 'quero' },
          { from: 'norte', text: 'Segue', pdf: 'CV_Nubank.pdf' }
        ]}
      />
    )
    expect(screen.getByText('Oi, Erick!')).toBeInTheDocument()
    expect(screen.getByText('quero')).toBeInTheDocument()
    expect(screen.getByText(/CV_Nubank\.pdf/)).toBeInTheDocument()
    expect(screen.getByText('online')).toBeInTheDocument()
  })

  it('hides the header when showHeader is false', () => {
    render(<NorteChat showHeader={false} messages={[{ from: 'norte', text: 'x' }]} />)
    expect(screen.queryByText('online')).not.toBeInTheDocument()
  })
})
