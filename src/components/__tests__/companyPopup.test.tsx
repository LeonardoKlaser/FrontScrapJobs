import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { RegistrationModal } from '../companyPopup'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { name?: string }) => opts?.name ?? key
  })
}))

const baseProps = {
  isOpen: true,
  onClose: vi.fn(),
  companyName: 'Acme',
  companyLogo: null,
  remainingSlots: 3,
  isAlreadyRegistered: false,
  isLoading: false,
  onRegister: vi.fn(),
  onUnRegister: vi.fn()
}

afterEach(() => {
  cleanup()
})

describe('RegistrationModal — splitIntoTags no fluxo de cadastro', () => {
  it('divide por vírgula', async () => {
    render(<RegistrationModal {...baseProps} />)
    fireEvent.change(screen.getByLabelText('popup.keywordsLabel'), {
      target: { value: 'react, senior' }
    })
    await waitFor(() => {
      expect(screen.getByText('react')).toBeTruthy()
      expect(screen.getByText('senior')).toBeTruthy()
    })
  })

  it('divide por espaço', async () => {
    render(<RegistrationModal {...baseProps} />)
    fireEvent.change(screen.getByLabelText('popup.keywordsLabel'), {
      target: { value: 'react senior' }
    })
    await waitFor(() => {
      expect(screen.getByText('react')).toBeTruthy()
      expect(screen.getByText('senior')).toBeTruthy()
    })
  })

  it('deduplica após fold', async () => {
    render(<RegistrationModal {...baseProps} />)
    fireEvent.change(screen.getByLabelText('popup.keywordsLabel'), {
      target: { value: 'React react' }
    })
    await waitFor(() => {
      expect(screen.getAllByText('react')).toHaveLength(1)
    })
  })

  it('fold de acento: São Paulo → sao paulo', async () => {
    render(<RegistrationModal {...baseProps} />)
    fireEvent.change(screen.getByLabelText('popup.keywordsLabel'), {
      target: { value: 'São Paulo' }
    })
    await waitFor(() => {
      expect(screen.getByText('sao')).toBeTruthy()
      expect(screen.getByText('paulo')).toBeTruthy()
    })
  })

  it('divide em pontuação: Full-Stack', async () => {
    render(<RegistrationModal {...baseProps} />)
    fireEvent.change(screen.getByLabelText('popup.keywordsLabel'), {
      target: { value: 'Full-Stack' }
    })
    await waitFor(() => {
      expect(screen.getByText('full')).toBeTruthy()
      expect(screen.getByText('stack')).toBeTruthy()
    })
  })

  it('onRegister recebe array split', async () => {
    const onRegister = vi.fn()
    render(<RegistrationModal {...baseProps} onRegister={onRegister} />)
    fireEvent.change(screen.getByLabelText('popup.keywordsLabel'), {
      target: { value: 'desenvolvedor senior, react' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'popup.confirmSubscription' }))
    expect(onRegister).toHaveBeenCalledWith(['desenvolvedor', 'senior', 'react'])
  })

  it('botão fica desabilitado quando input só tem pontuação', () => {
    render(<RegistrationModal {...baseProps} />)
    fireEvent.change(screen.getByLabelText('popup.keywordsLabel'), {
      target: { value: '---' }
    })
    const btn = screen.getByRole('button', { name: 'popup.confirmSubscription' })
    expect((btn as HTMLButtonElement).disabled).toBe(true)
  })

  // Paridade backend/frontend: mesma ordem de transformação (ToLower → NFD
  // → strip Mn → NFC). Edge cases tomados do Tokenize do backend.
  it('fold Unicode: eszett mantém como single token', async () => {
    render(<RegistrationModal {...baseProps} />)
    fireEvent.change(screen.getByLabelText('popup.keywordsLabel'), {
      target: { value: 'Straße' }
    })
    await waitFor(() => {
      expect(screen.getByText('straße')).toBeTruthy()
    })
  })

  it('fold Unicode: diacríticos múltiplos viram ASCII', async () => {
    render(<RegistrationModal {...baseProps} />)
    fireEvent.change(screen.getByLabelText('popup.keywordsLabel'), {
      target: { value: 'DESENVÖLVEDOR Sênior café' }
    })
    await waitFor(() => {
      expect(screen.getByText('desenvolvedor')).toBeTruthy()
      expect(screen.getByText('senior')).toBeTruthy()
      expect(screen.getByText('cafe')).toBeTruthy()
    })
  })
})

describe('RegistrationModal — splitIntoTags no fluxo de edição', () => {
  const editProps = {
    ...baseProps,
    isAlreadyRegistered: true,
    currentTargetWords: ['desenvolvedor senior'],
    onUpdateFilters: vi.fn(),
    isUpdatingFilters: false
  }

  it('hydrate: legacy multi-palavra aparece já split', async () => {
    render(<RegistrationModal {...editProps} />)
    await waitFor(() => {
      expect(screen.getByText('desenvolvedor')).toBeTruthy()
      expect(screen.getByText('senior')).toBeTruthy()
    })
  })

  it('Enter no input com espaço adiciona dois tokens', async () => {
    render(<RegistrationModal {...editProps} currentTargetWords={[]} />)
    const input = screen.getByPlaceholderText('popup.keywordsPlaceholder')
    fireEvent.change(input, { target: { value: 'a b' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    await waitFor(() => {
      expect(screen.getByText('a')).toBeTruthy()
      expect(screen.getByText('b')).toBeTruthy()
    })
  })
})
