import { useCallback, useRef, useState } from 'react'

// useInViewOnce dispara `true` na primeira vez que o elemento entra na viewport e
// nunca mais volta pra false. Usa um *callback ref* de proposito: ao contrario do
// A implementação liga o IntersectionObserver no mount, com o
// ref ainda null se o componente faz early-return antes dos dados chegarem), o
// callback ref roda toda vez que o no monta/desmonta — entao o observer e ligado
// no momento certo, mesmo que o elemento so apareca depois de um fetch async.
// Esse era o bug do contador da proof band travado em 0.
export function useInViewOnce<T extends Element>(
  options: IntersectionObserverInit = { rootMargin: '-80px' }
): [(node: T | null) => void, boolean] {
  const [inView, setInView] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const seenRef = useRef(false)

  const ref = useCallback((node: T | null) => {
    observerRef.current?.disconnect()
    if (!node || seenRef.current) return

    // jsdom/SSR nao tem IntersectionObserver — assume visivel pra nao travar o
    // conteudo (e a animacao de count-up) em 0.
    if (typeof IntersectionObserver === 'undefined') {
      seenRef.current = true
      setInView(true)
      return
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        seenRef.current = true
        setInView(true)
        observerRef.current?.disconnect()
      }
    }, options)
    observerRef.current.observe(node)
    // options e recriado a cada render, mas ligamos o observer uma unica vez
    // (seenRef protege) — deps vazias de proposito.
  }, [])

  return [ref, inView]
}
