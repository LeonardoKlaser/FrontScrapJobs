import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CurriculumFileCard } from '../curriculum-file-card'
import type { CurriculumFile } from '@/models/curriculum'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts && typeof opts.filename === 'string') return `${key}:${opts.filename}`
      if (opts && typeof opts.date === 'string') return `${key}:${opts.date}`
      return key
    },
    i18n: { language: 'pt-BR' }
  })
}))

const file: CurriculumFile = {
  id: 1,
  filename: 'cv.pdf',
  size_bytes: 204800,
  is_principal: false,
  created_at: '2026-01-01T00:00:00Z'
}

function renderCard(overrides: Partial<Parameters<typeof CurriculumFileCard>[0]> = {}) {
  const onView = vi.fn()
  const onSetPrincipal = vi.fn()
  const onDelete = vi.fn()
  const { container } = render(
    <CurriculumFileCard
      file={file}
      isSelected={false}
      onView={onView}
      onSetPrincipal={onSetPrincipal}
      onDelete={onDelete}
      {...overrides}
    />
  )
  const card = container.querySelector('[data-slot="card"]') as HTMLElement
  return { card, onView, onSetPrincipal, onDelete }
}

// O container do card NÃO deve ganhar role="button"/tabIndex/onKeyDown: com 4
// controles interativos reais dentro (view/download/star/delete), isso seria
// nested-interactive (violação de axe) e presentational-children de ARIA —
// leitores de tela podem podar as ações internas por completo, uma regressão
// de a11y pior do que o gap de teclado que a role tentava cobrir. O caminho
// de teclado real já existe: o botão "visualizar" (Eye, linha ~82) é um
// <button> nativo focável que chama o mesmo onView.
describe('CurriculumFileCard — clique no card e caminho de teclado', () => {
  it('o container do card não expõe role="button" nem tabIndex', () => {
    const { card } = renderCard()

    expect(card).not.toHaveAttribute('role', 'button')
    expect(card).not.toHaveAttribute('tabindex')
  })

  it('clique no corpo do card (fora das ações) chama onView', async () => {
    const { card, onView } = renderCard()

    await userEvent.click(card)

    expect(onView).toHaveBeenCalledTimes(1)
  })

  it('o botão "visualizar" é um <button> nativo focável — caminho de teclado real', () => {
    renderCard()

    const viewButton = screen.getByRole('button', { name: 'list.viewAction' })
    expect(viewButton.tagName).toBe('BUTTON')
  })

  it('clicar no botão "visualizar" chama onView (mesmo handler do clique no card)', async () => {
    const { onView } = renderCard()

    await userEvent.click(screen.getByRole('button', { name: 'list.viewAction' }))

    expect(onView).toHaveBeenCalledTimes(1)
  })

  it('clicar em outras ações (excluir) não chama onView — stopPropagation da linha de ações', async () => {
    const { onView } = renderCard()

    await userEvent.click(screen.getByRole('button', { name: 'list.deleteAction' }))

    expect(onView).not.toHaveBeenCalled()
  })
})
