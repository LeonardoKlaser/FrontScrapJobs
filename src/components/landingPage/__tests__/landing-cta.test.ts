import { describe, it, expect, vi, afterEach } from 'vitest'
import { scrollToId } from '@/components/landingPage/landing-cta'

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('scrollToId', () => {
  it('smooth-scrolls the element when it exists', () => {
    const el = document.createElement('div')
    el.id = 'pricing'
    document.body.appendChild(el)
    const spy = vi.spyOn(el, 'scrollIntoView').mockImplementation(() => {})
    scrollToId('pricing')
    expect(spy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })

  it('is a no-op when the element is missing', () => {
    expect(() => scrollToId('does-not-exist')).not.toThrow()
  })
})
