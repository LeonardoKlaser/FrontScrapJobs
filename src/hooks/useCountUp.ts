import { useEffect, useState } from 'react'

interface UseCountUpOptions {
  target: number
  inView: boolean
  duration?: number
  decimals?: number
}

export function useCountUp({
  target,
  inView,
  duration = 1.5,
  decimals = 0
}: UseCountUpOptions): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return

    const start = performance.now()
    let rafId: number

    const animate = (now: number) => {
      const elapsed = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - elapsed, 3)
      const current = target * eased

      setValue(decimals > 0 ? Number(current.toFixed(decimals)) : Math.round(current))

      if (elapsed < 1) {
        rafId = requestAnimationFrame(animate)
      } else {
        setValue(target)
      }
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [inView, target, duration, decimals])

  return value
}
