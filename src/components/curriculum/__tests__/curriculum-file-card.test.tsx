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
  render(
    <CurriculumFileCard
      file={file}
      isSelected={false}
      onView={onView}
      onSetPrincipal={onSetPrincipal}
      onDelete={onDelete}
      {...overrides}
    />
  )
  return { onView, onSetPrincipal, onDelete }
}

describe('CurriculumFileCard — a11y do card clicável', () => {
  it('expõe role="button", tabIndex=0 e aria-label com o nome do arquivo', () => {
    renderCard()

    const card = screen.getByRole('button', { name: 'list.viewCardLabel:cv.pdf' })
    expect(card).toHaveAttribute('tabIndex', '0')
  })

  it('clique no card chama onView', async () => {
    const { onView } = renderCard()

    await userEvent.click(screen.getByRole('button', { name: 'list.viewCardLabel:cv.pdf' }))

    expect(onView).toHaveBeenCalledTimes(1)
  })

  it('tecla Enter com foco no card chama onView', () => {
    const { onView } = renderCard()

    const card = screen.getByRole('button', { name: 'list.viewCardLabel:cv.pdf' })
    card.focus()
    // fireEvent via userEvent.keyboard respeita o elemento focado
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

    expect(onView).toHaveBeenCalledTimes(1)
  })

  it('tecla Espaço com foco no card chama onView', () => {
    const { onView } = renderCard()

    const card = screen.getByRole('button', { name: 'list.viewCardLabel:cv.pdf' })
    card.focus()
    card.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))

    expect(onView).toHaveBeenCalledTimes(1)
  })

  it('outras teclas não chamam onView', () => {
    const { onView } = renderCard()

    const card = screen.getByRole('button', { name: 'list.viewCardLabel:cv.pdf' })
    card.focus()
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }))

    expect(onView).not.toHaveBeenCalled()
  })

  it('keydown originado num botão aninhado (ex.: excluir) não dispara onView de novo', () => {
    const { onView } = renderCard()

    const deleteButton = screen.getByRole('button', { name: 'list.deleteAction' })
    deleteButton.focus()
    deleteButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

    // o guard target===currentTarget no Card evita que o keydown borbulhado
    // do botão aninhado dispare onView — a ação do botão aninhado é dele
    expect(onView).not.toHaveBeenCalled()
  })
})
