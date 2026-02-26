import { useState, useCallback, useEffect, useRef } from 'react'

type ButtonState = 'idle' | 'loading' | 'success' | 'error'

interface UseButtonStateOptions {
  resetDelay?: number
}

export function useButtonState({ resetDelay = 2000 }: UseButtonStateOptions = {}) {
  const [buttonState, setButtonState] = useState<ButtonState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const scheduleReset = useCallback(() => {
    clearTimer()
    timerRef.current = setTimeout(() => {
      setButtonState('idle')
    }, resetDelay)
  }, [clearTimer, resetDelay])

  const setLoading = useCallback(() => {
    clearTimer()
    setButtonState('loading')
  }, [clearTimer])

  const setSuccess = useCallback(() => {
    setButtonState('success')
    scheduleReset()
  }, [scheduleReset])

  const setError = useCallback(() => {
    setButtonState('error')
    scheduleReset()
  }, [scheduleReset])

  const reset = useCallback(() => {
    clearTimer()
    setButtonState('idle')
  }, [clearTimer])

  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  return {
    buttonState,
    setLoading,
    setSuccess,
    setError,
    reset,
    isDisabled: buttonState === 'loading' || buttonState === 'success'
  }
}
