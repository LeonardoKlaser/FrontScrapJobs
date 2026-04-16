import { renderHook, act } from '@testing-library/react'
import { useCountUp } from '@/hooks/useCountUp'

describe('useCountUp', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna 0 inicialmente quando inView é false', () => {
    const { result } = renderHook(() => useCountUp({ target: 100, inView: false }))
    expect(result.current).toBe(0)
  })

  it('retorna target após completar a animação', () => {
    const { result, rerender } = renderHook(
      ({ inView }) => useCountUp({ target: 100, inView, duration: 1 }),
      { initialProps: { inView: false } }
    )
    expect(result.current).toBe(0)

    rerender({ inView: true })

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(result.current).toBe(100)
  })

  it('respeita decimals e não arredonda no valor final', () => {
    const { result, rerender } = renderHook(
      ({ inView }) => useCountUp({ target: 4.7, inView, duration: 1, decimals: 1 }),
      { initialProps: { inView: false } }
    )
    expect(result.current).toBe(0)

    rerender({ inView: true })

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(result.current).toBe(4.7)
  })
})
