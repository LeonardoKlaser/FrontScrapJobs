import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DowngradeUltraModal } from '../DowngradeUltraModal'

describe('DowngradeUltraModal', () => {
  afterEach(cleanup)

  it('mostra a copy correta quando aberto', () => {
    render(<DowngradeUltraModal open onConfirm={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByText('Sair do Ultra?')).toBeInTheDocument()
    expect(screen.getByText(/não receberá mais vagas automaticamente/i)).toBeInTheDocument()
    expect(screen.getByText(/inscrever manualmente em até 40 empresas/i)).toBeInTheDocument()
    expect(screen.getByText(/fale com o norte no whatsapp/i)).toBeInTheDocument()
  })

  it('não renderiza conteúdo quando fechado', () => {
    render(<DowngradeUltraModal open={false} onConfirm={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.queryByText('Sair do Ultra?')).not.toBeInTheDocument()
  })

  it('chama onConfirm ao clicar em "Confirmar downgrade"', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<DowngradeUltraModal open onConfirm={onConfirm} onCancel={vi.fn()} />)

    await user.click(screen.getByText(/confirmar downgrade/i))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('chama onCancel ao clicar em "Cancelar" e não chama onConfirm', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<DowngradeUltraModal open onConfirm={onConfirm} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /^cancelar$/i }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('desabilita os botões quando isConfirming é true', () => {
    render(<DowngradeUltraModal open onConfirm={vi.fn()} onCancel={vi.fn()} isConfirming />)

    expect(screen.getByText(/confirmar downgrade/i).closest('button')).toBeDisabled()
    expect(screen.getByRole('button', { name: /^cancelar$/i })).toBeDisabled()
  })
})
