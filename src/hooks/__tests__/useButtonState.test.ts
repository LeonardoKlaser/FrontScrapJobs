import { renderHook, act } from '@testing-library/react'
import { useButtonState } from '@/hooks/useButtonState'

describe('useButtonState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts in idle state', () => {
    const { result } = renderHook(() => useButtonState())
    expect(result.current.buttonState).toBe('idle')
    expect(result.current.isDisabled).toBe(false)
  })

  it('transitions to loading state', () => {
    const { result } = renderHook(() => useButtonState())

    act(() => {
      result.current.setLoading()
    })

    expect(result.current.buttonState).toBe('loading')
    expect(result.current.isDisabled).toBe(true)
  })

  it('transitions to success and auto-resets after delay', () => {
    const { result } = renderHook(() => useButtonState())

    act(() => {
      result.current.setLoading()
    })

    act(() => {
      result.current.setSuccess()
    })

    expect(result.current.buttonState).toBe('success')
    expect(result.current.isDisabled).toBe(true)

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.buttonState).toBe('idle')
    expect(result.current.isDisabled).toBe(false)
  })

  it('transitions to error and auto-resets after delay', () => {
    const { result } = renderHook(() => useButtonState())

    act(() => {
      result.current.setError()
    })

    expect(result.current.buttonState).toBe('error')

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.buttonState).toBe('idle')
  })

  it('resets to idle manually', () => {
    const { result } = renderHook(() => useButtonState())

    act(() => {
      result.current.setLoading()
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.buttonState).toBe('idle')
    expect(result.current.isDisabled).toBe(false)
  })

  it('uses custom resetDelay', () => {
    const { result } = renderHook(() => useButtonState({ resetDelay: 500 }))

    act(() => {
      result.current.setSuccess()
    })

    expect(result.current.buttonState).toBe('success')

    act(() => {
      vi.advanceTimersByTime(499)
    })

    expect(result.current.buttonState).toBe('success')

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(result.current.buttonState).toBe('idle')
  })

  it('cancels previous timer on rapid transitions', () => {
    const { result } = renderHook(() => useButtonState())

    act(() => {
      result.current.setSuccess()
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    act(() => {
      result.current.setLoading()
    })

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(result.current.buttonState).toBe('loading')
  })

  it('cleans up timer on unmount', () => {
    const { result, unmount } = renderHook(() => useButtonState())

    act(() => {
      result.current.setSuccess()
    })

    unmount()

    act(() => {
      vi.advanceTimersByTime(3000)
    })
  })
})
