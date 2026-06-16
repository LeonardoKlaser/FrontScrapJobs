import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { PhoneStep } from './PhoneStep'

// t devolve o texto default (2º arg) — as mensagens de validação do schema são PT fixas.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, d?: string) => (typeof d === 'string' ? d : k) })
}))

afterEach(cleanup)

describe('PhoneStep (A2: validação espelha IsValidBRCellphone)', () => {
  it('aceita celular nacional válido (11 dígitos com 9) e envia só os dígitos', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<PhoneStep onSubmit={onSubmit} loading={false} error={null} />)

    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Maria' } })
    fireEvent.change(screen.getByLabelText('WhatsApp'), { target: { value: '11999999999' } })
    fireEvent.click(screen.getByRole('button', { name: /Enviar código/ }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('Maria', '11999999999'))
  })

  it('rejeita número de 10 dígitos (sem o 9) e não chama onSubmit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<PhoneStep onSubmit={onSubmit} loading={false} error={null} />)

    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Maria' } })
    fireEvent.change(screen.getByLabelText('WhatsApp'), { target: { value: '1188888888' } })
    fireEvent.click(screen.getByRole('button', { name: /Enviar código/ }))

    expect(await screen.findByText(/11 dígitos/)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejeita 11 dígitos sem o 9 no 3º dígito', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<PhoneStep onSubmit={onSubmit} loading={false} error={null} />)

    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Maria' } })
    fireEvent.change(screen.getByLabelText('WhatsApp'), { target: { value: '11888888888' } })
    fireEvent.click(screen.getByRole('button', { name: /Enviar código/ }))

    expect(await screen.findByText(/9 após o DDD/)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
