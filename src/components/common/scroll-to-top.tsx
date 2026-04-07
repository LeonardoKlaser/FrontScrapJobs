import { useEffect } from 'react'
import { useLocation } from 'react-router'

export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const id = hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
      const observer = new MutationObserver(() => {
        const target = document.getElementById(id)
        if (target) {
          observer.disconnect()
          target.scrollIntoView({ behavior: 'smooth' })
        }
      })
      observer.observe(document.body, { childList: true, subtree: true })
      const timeout = setTimeout(() => observer.disconnect(), 5000)
      return () => {
        observer.disconnect()
        clearTimeout(timeout)
      }
    }
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
