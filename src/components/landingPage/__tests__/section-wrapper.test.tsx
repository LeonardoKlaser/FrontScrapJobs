import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SectionWrapper } from '@/components/landingPage/section-wrapper'

describe('SectionWrapper', () => {
  it('forwards the id to the outer section so anchors keep working', () => {
    const { container } = render(
      <SectionWrapper id="pricing">
        <p>content</p>
      </SectionWrapper>
    )
    expect(container.querySelector('section#pricing')).not.toBeNull()
  })

  it('drops the striped side rails', () => {
    const { container } = render(
      <SectionWrapper id="faq">
        <p>content</p>
      </SectionWrapper>
    )
    expect(container.querySelector('.bg-stripes')).toBeNull()
    expect(container.querySelector('.bg-stripes-dark')).toBeNull()
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('keeps the content div with its className', () => {
    const { getByText } = render(
      <SectionWrapper className="py-10">
        <span>hello</span>
      </SectionWrapper>
    )
    const content = getByText('hello').parentElement
    expect(content).toHaveClass('py-10')
  })
})
