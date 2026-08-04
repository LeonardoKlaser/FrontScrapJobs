import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Logo, LogoMark } from '../logo'

describe('Logo', () => {
  it('expõe o nome da marca uma única vez quando o texto está visível', () => {
    render(
      <a href="/">
        <Logo showText />
      </a>
    )

    expect(screen.getByRole('link')).toHaveAccessibleName('ScrapJobs')
  })

  it('mantém a marca isolada nomeada', () => {
    const { rerender } = render(<LogoMark />)

    expect(screen.getByRole('img')).toHaveAccessibleName('ScrapJobs')

    rerender(<Logo />)

    expect(screen.getByRole('img')).toHaveAccessibleName('ScrapJobs')
  })
})
